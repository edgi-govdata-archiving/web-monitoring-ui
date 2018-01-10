import React from 'react';
import SandboxedHtml from './sandboxed-html';

/**
 * @typedef {Object} InlineRenderedDiffProps
 * @property {DiffData} diffData Object containing diff to render and its metadata
 * @property {Page} page The page this diff pertains to
 */

/**
 * Display two versions of a page with their changes inline together.
 *
 * @class InlineRenderedDiff
 * @extends {React.Component}
 * @param {InlineRenderedDiffProps} props
 */
export default class InlineRenderedDiff extends React.Component {
  render () {
    if (this.props.diffData.change_count === 0) {
      return <div className="diff-text-inline">
        There were no changes for this diff type.</div>;
    }

    const diff = this.props.diffData.combined || this.props.diffData.diff;

    return (
      <div className="inline-render">
        <SandboxedHtml html={diff} baseUrl={this.props.page.url} />
      </div>
    );
  }
}
