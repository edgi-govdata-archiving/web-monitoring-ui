import React from 'react';

/**
 * @typedef {Object} SideBySideRenderedDiffProps
 * @property {Version} a The "from" version
 * @property {Version} b The "to" version
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
    super(props);
    this.frameA = null;
    this.frameB = null;
  }

  render () {
    if (!this.props) {
      return null;
    }

    return (
      <div className="side-by-side-render">
        <iframe sandbox="allow-forms allow-scripts" ref={frame => this.frameA = frame} />
        <iframe sandbox="allow-forms allow-scripts" ref={frame => this.frameB = frame} />
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

    this.frameA.setAttribute(
      'srcdoc',
      createChangedSource(raw_source, this.props.page, 'removals'));
    this.frameB.setAttribute(
      'srcdoc',
      createChangedSource(raw_source, this.props.page, 'additions'));
  }
}

/**
 * Create renderable HTML source code rendering either the added or removed
 * parts of the page from a an HTML diff representing the full change between
 * two versions.
 *
 * @param {string} source Full diff source code
 * @param {Page} page The page that is being diffed
 * @param {string} viewType Either `additions` or `removals`
 */
function createChangedSource (source, page, viewType) {
  const elementToRemove = viewType === 'additions' ? 'del' : 'ins';
  const elementExpression =
    new RegExp(`<${elementToRemove}[^>]*>[^]*?</${elementToRemove}>`, 'ig');

  const newSource = source
    .replace(/<head[^]*<\/head>/i, head => {
      return head
        // Remove unwanted elements in <head> so we don’t load wrong resources
        .replace(elementExpression, '')
        // Visually hide elements in body because we remove them after load
        .replace(`${elementToRemove} {`, `${elementToRemove} {display: none;`);
    })
    // Add removeChangeElements() function to remove unwanted elements at end
    // of doc. We do it this way because we need a tree to operate on.
    .replace(/<\/body/, `<script type="text/javascript">
      (${removeChangeElements})('${elementToRemove}');
    </script></body`);

  return renderableSource(newSource, page);
}

/**
 * Process HTML source code so that it renders nicely. This includes things like
 * adding a `<base>` tag so subresources are properly fetched.
 *
 * @param {string} source
 * @param {Page} page
 * @returns {string}
 */
function renderableSource (source, page) {
  // <meta charset> tags don't work unless they are first, so if one is
  // present, modify <head> content *after* it.
  const hasCharsetTag = /<meta charset[^>]+>/.test(source);
  const headMatcher = hasCharsetTag ? /<meta charset[^>]+>/ : /<head[^>]*>/;
  const result = source.replace(headMatcher, followTag => {
    return `${followTag}\n<base href="${page.url}">\n`;
  });

  return result;
}

/**
 * Remove HTML elements representing additions or removals from a page.
 * If removing an element leaves its parent element empty, the parent element
 * is also removed, and so on recursively up the tree. This is meant to
 * compensate for the fact that our diff is really a text diff that is
 * sensitive to the tree and not an actual tree diff.
 *
 * NOTE: this method is meant to be converted to source code and run *in the
 * context of the web page itself.*
 *
 * @param {string} type  Element type to remove, i.e. `ins` or `del`.
 */
function removeChangeElements (type) {
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
  document.querySelectorAll(type).forEach(element => {
    parents.add(element.parentNode);
    element.parentNode.removeChild(element);
  });
  removeEmptyParents(parents);
}
