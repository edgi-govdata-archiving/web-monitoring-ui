import React from 'react';

import {
  removeStyleAndScript,
  loadSubresourcesFromWayback,
  compose
} from '../scripts/html-transforms';
import { versionUrl } from '../scripts/tools';
import SandboxedHtml from './sandboxed-html';

/**
 * @typedef {Object} InlineRenderedDiffProps
 * @property {DiffData} diffData Object containing diff to render and its metadata
 * @property {Page} page The page this diff pertains to
 * @property {Version} a The "A" version of the page this diff pertains to
 * @property {Version} b The "B" version of the page this diff pertains to
 * @property {boolean} removeFormatting
 * @property {boolean} useWaybackResources
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
    const diff = this.props.diffData.combined || this.props.diffData.diff;
    const transformDocument = compose(
      this.props.removeFormatting && removeStyleAndScript,
      this.props.useWaybackResources && loadSubresourcesFromWayback(
        this.props.page,
        this.props.b
      )
    );

    return (
      <div className="inline-render">
        <SandboxedHtml html={diff} baseUrl={versionUrl(this.props.b)} transform={transformDocument}/>
      </div>
    );
  }
}
