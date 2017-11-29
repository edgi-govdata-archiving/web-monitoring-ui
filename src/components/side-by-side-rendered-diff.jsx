import React from 'react';

/**
 * @typedef {Object} SideBySideRenderedDiffProps
 * @property {Diff} diff The diff to render
 * @property {Page} page The page this diff pertains to
 */

/**
 * Display two versions of a page, side-by-side.
 *
 * @class SideBySideRenderedDiff
 * @extends {React.Component}
 * @params {SideBySideRenderedDiffProps} props
 */
export default class SideBySideRenderedDiff extends React.Component {
  constructor (props) {
    super (props);
    this.frameA = null;
    this.frameB = null;
  }

  render () {
    if (!this.props) {
      return null;
    }
    const onlyOneVersion = this.props.diff.from_version_id === this.props.diff.to_version_id;

    return (
      <div className="side-by-side-render">
        <iframe sandbox="allow-forms allow-scripts" ref={frame => this.frameA = frame} />
        {(onlyOneVersion) ? null : <iframe sandbox="allow-forms allow-scripts" ref={frame => this.frameB = frame} />}
      </div>
    );
  }

  /**
     * @param {SideBySideRenderedDiffProps} nextProps
     * @param {Object} nextState
     * @returns {boolean}
     */
  shouldComponentUpdate (nextProps, nextState) {
    return nextProps.diff.from_version_id !== this.props.diff.from_version_id
      || nextProps.diff.to_version_id !== this.props.diff.to_version_id;
  }

  componentDidMount () {
    this._updateContent();
  }

  componentDidUpdate () {
    this._updateContent();
  }

  _updateContent () {
    const raw_source = this.props.diff.content.diff;

    if (this.frameA) {
      this.frameA.setAttribute(
        'srcdoc',
        createChangedSource(raw_source, this.props.page, 'removals'));
    }

    if (this.frameB) {
      this.frameB.setAttribute(
        'srcdoc',
        createChangedSource(raw_source, this.props.page, 'additions'));
    }
  }
}

/**
 * Create renderable HTML source code rendering either the added or removed
 * parts of the page from an HTML diff representing the full change between
 * two versions.
 *
 * @param {string} source Full diff source code
 * @param {Page} page The page that is being diffed
 * @param {string} viewType Either `additions` or `removals`
 */
function createChangedSource (source, page, viewType) {
  const elementToRemove = viewType === 'additions' ? 'del' : 'ins';

  let newSource = source;
  // TODO: remove this when new diffs are fully deployed; they no longer have
  // `<ins>/<del>` in the `<head>`.
  const hasOldHeadTemplate = !!source.match(/<template id="wm-diff-old-head"/i);
  if (!hasOldHeadTemplate) {
    // Remove <ins/del> in <head> before parsing; parsing will throw them out
    // but keep their contents. That could leave us with <link> or <script>
    // elements that should have been removed.
    newSource = source.replace(/<head[^]*<\/head>/i, head => {
      return head.replace(
        new RegExp(`<${elementToRemove}[^>]*>[^]*?</${elementToRemove}>`, 'ig'),
        '');
    });
  }

  const parser = new DOMParser();
  const newDocument = parser.parseFromString(newSource, 'text/html');
  // Rebuild <head> with contents of old version's `<head>`
  if (hasOldHeadTemplate && viewType !== 'additions') {
    const oldHead = newDocument.getElementById('wm-diff-old-head').content;
    const styling = newDocument.getElementById('wm-diff-style');
    const titleDiff = newDocument.querySelector('meta[name="wm-diff-title"]');
    newDocument.head.innerHTML = '';
    newDocument.head.appendChild(oldHead);
    newDocument.head.appendChild(styling);
    newDocument.head.appendChild(titleDiff);
  }
  removeChangeElements(elementToRemove, newDocument);
  renderableDocument(newDocument, page);
  activateInertChangeElements(viewType, newDocument);

  const prefix = source.match(/^[^]*?<html/ig)[0];
  newSource = prefix + newDocument.documentElement.outerHTML.slice(5);

  return newSource;
}

/**
 * Process HTML document so that it renders nicely. This includes things like
 * adding a `<base>` tag so subresources are properly fetched.
 *
 * @param {HTMLDocument} sourceDocument
 * @param {Page} page
 * @returns {HTMLDocument}
 */
function renderableDocument (sourceDocument, page) {
  const base = sourceDocument.createElement('base');
  base.href = page.url;
  // <meta charset> tags don't work unless they are first, so if one is
  // present, modify <head> content *after* it.
  const charsetElement = sourceDocument.querySelector('meta[charset]');
  if (charsetElement) {
    charsetElement.insertAdjacentElement('afterend', base);
  }
  else {
    sourceDocument.head.insertAdjacentElement('afterbegin', base);
  }

  // TODO: remove this block when new diff (indicated by presence of
  // wm-diff-style) is fully deployed.
  if (!sourceDocument.getElementById('wm-diff-style')) {
    // The differ currently HTML-encodes the source code in these elements :\
    // https://github.com/edgi-govdata-archiving/web-monitoring-processing/issues/94
    sourceDocument.querySelectorAll('style, script').forEach(element => {
      element.textContent = element.textContent
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#(x?)([0-9a-f]+);/ig, (text, hex, value) => {
          const code = parseInt(value, hex ? 16 : 10);
          return String.fromCharCode(code);
        });
    });
  }

  return sourceDocument;
}

/**
 * Remove HTML elements representing additions or removals from a document.
 * If removing an element leaves its parent element empty, the parent element
 * is also removed, and so on recursively up the tree. This is meant to
 * compensate for the fact that our diff is really a text diff that is
 * sensitive to the tree and not an actual tree diff.
 *
 * @param {string} type  Element type to remove, i.e. `ins` or `del`.
 * @param {HTMLDocument} sourceDocument  Document to remove elements from.
 */
function removeChangeElements (type, sourceDocument) {
  function removeEmptyParents (elements) {
    if (elements.size === 0) return;

    const parents = new Set();
    elements.forEach(element => {
      if (element.parentNode
          && element.childElementCount === 0
          && /^[\s\n\r]*$/.test(element.textContent)) {
        parents.add(element.parentNode);
        element.parentNode.removeChild(element);
      }
    });

    return removeEmptyParents(parents);
  }

  const parents = new Set();
  sourceDocument.querySelectorAll(type).forEach(element => {
    parents.add(element.parentNode);
    element.parentNode.removeChild(element);
  });
  removeEmptyParents(parents);
}

/**
 * Activate inert (embedded in `<template>`) elements (e.g. scripts and styles)
 * that were removed as part of the represented change and remove elements that
 * were added. If the `viewType` is `additions`, this does nothing, since added
 * elements are already active.
 *
 * @param {'additions'|'deletions'} viewType Type of view to restrict to
 * @param {HTMLDocument} sourceDocument Document to activate or deactivate
 *                                      elements within
 */
function activateInertChangeElements (viewType, sourceDocument) {
  if ( viewType === 'additions') {
    return;
  }

  sourceDocument.querySelectorAll('.wm-diff-inserted-active')
    .forEach(item => item.remove());

  sourceDocument.querySelectorAll('.wm-diff-deleted-inert')
    .forEach(item => {
      const content = item.content;
      item.parentNode.insertBefore(content, item);
      item.remove();
    });
}
