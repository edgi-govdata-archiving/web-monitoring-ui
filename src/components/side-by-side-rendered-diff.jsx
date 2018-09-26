import React from 'react';
import {
  removeStyleAndScript,
  loadSubresourcesFromWayback,
  compose
} from '../scripts/html-transforms';
import SandboxedHtml from './sandboxed-html';

/**
 * @typedef {Object} SideBySideRenderedDiffProps
 * @property {DiffData} diffData Object containing diff to render and its metadata
 * @property {Page} page The page this diff pertains to
 * @property {Version} a The "A" version of the page this diff pertains to
 * @property {Version} b The "B" version of the page this diff pertains to
 * @property {boolean} removeFormatting
 * @property {boolean} useWaybackResources
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
    const baseTransform = this.props.removeFormatting && removeStyleAndScript;
    let transformA = baseTransform;
    let transformB = baseTransform;
    if (this.props.useWaybackResources) {
      transformA = compose(transformA, loadSubresourcesFromWayback(
        this.props.page,
        this.props.a
      ));
      transformB = compose(transformB, loadSubresourcesFromWayback(
        this.props.page,
        this.props.b
      ));
    }

    return (
      <div className="side-by-side-render">
        <SandboxedHtml
          html={this.props.diffData.deletions}
          baseUrl={this.props.page.url}
          transform={transformA}
        />
        <SandboxedHtml
          html={this.props.diffData.insertions}
          baseUrl={this.props.page.url}
          transform={transformB}
        />
      </div>
    );
  }
}
