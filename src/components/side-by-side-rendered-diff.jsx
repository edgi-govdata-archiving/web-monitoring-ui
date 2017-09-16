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
    const removals = raw_source.replace(/<ins[^>]*>[^]*?<\/ins>/ig, '');
    const additions = raw_source.replace(/<del[^>]*>[^]*?<\/del>/ig, '');

    this.frameA.setAttribute(
      'srcdoc',
      processSource(removals, this.props.page));
    this.frameB.setAttribute(
      'srcdoc',
      processSource(additions, this.props.page));
  }
}

/**
 * Process HTML source code so that it renders nicely. This includes things like
 * adding a `<base>` tag so subresources are properly fetched.
 *
 * @param {string} source
 * @param {Page} page
 * @returns {string}
 */
function processSource (source, page) {
  // <meta charset> tags don't work unless they are first, so if one is
  // present, modify <head> content *after* it.
  const hasCharsetTag = /<meta charset[^>]+>/.test(source);
  const headMatcher = hasCharsetTag ? /<meta charset[^>]+>/ : /<head[^>]*>/;
  const result = source.replace(headMatcher, followTag => {
    return `${followTag}\n<base href="${page.url}">\n`;
  });

  return result;
}
