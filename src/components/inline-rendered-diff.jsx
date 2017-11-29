import React from 'react';

/**
 * @typedef {Object} InlineRenderedDiffProps
 * @property {Diff} diff The diff to render
 * @property {Page} page The page this diff pertains to
 */

/**
 * Display two versions of a page with their changes inline together.
 *
 * @class InlineRenderedDiff
 * @extends {React.Component}
 * @params {InlineRenderedDiffProps} props
 */
export default class InlineRenderedDiff extends React.Component {
  constructor (props) {
    super(props);
    this.frame = null;
  }

  render () {
    if (!this.props) {
      return null;
    }

    return (
      <div className="inline-render">
        <iframe sandbox="allow-forms allow-scripts" ref={frame => this.frame = frame} />
      </div>
    );
  }

  /**
     * @param {InlineRenderedDiffProps} nextProps
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

    this.frame.setAttribute(
      'srcdoc',
      renderableSource(raw_source, this.props.page));
  }
}

/**
 * Create renderable HTML source code from the raw HTML source of the diff.
 *
 * @param {string} source Full diff source code
 * @param {Page} page The page that is being diffed
 * @param {string} viewType Either `additions` or `removals`
 */
function renderableSource (source, page, viewType) {
  const parser = new DOMParser();
  const newDocument = parser.parseFromString(source, 'text/html');
  renderableDocument(newDocument, page);
  const prefix = source.match(/^[^]*?<html/ig)[0];
  return prefix + newDocument.documentElement.outerHTML.slice(5);
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
