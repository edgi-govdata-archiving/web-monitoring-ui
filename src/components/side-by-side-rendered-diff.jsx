import React from 'react';
import SandboxedHtml from './sandboxed-html';

/**
 * @typedef {Object} SideBySideRenderedDiffProps
 * @property {DiffData} diffData Object containing diff to render and its metadata
 * @property {Page} page The page this diff pertains to
 */

/**
 * Display two versions of a page, side-by-side.
 *
 * @class SideBySideRenderedDiff
 * @extends {React.Component}
 * @param {SideBySideRenderedDiffProps} props
 */
export default class SideBySideRenderedDiff extends React.Component {
  render () {
    return (
      <div className="side-by-side-render">
        <SandboxedHtml
          html={this.props.diffData.deletions}
          baseUrl={this.props.page.url}
        />
        <SandboxedHtml
          html={this.props.diffData.insertions}
          baseUrl={this.props.page.url}
        />
      </div>
    );
  }
}
