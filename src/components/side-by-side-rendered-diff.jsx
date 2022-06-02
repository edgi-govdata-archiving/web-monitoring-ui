import { Component } from 'react';
import {
  removeStyleAndScript,
  removeClientRedirect,
  loadSubresourcesFromWayback,
  compose,
  addTargetBlank
} from '../scripts/html-transforms';
import { versionUrl } from '../scripts/tools';
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
 * @extends {Component}
 * @param {SideBySideRenderedDiffProps} props
 */
export default class SideBySideRenderedDiff extends Component {
  render () {
    const baseTransform = compose(
      this.props.removeFormatting && removeStyleAndScript,
      addTargetBlank,
      removeClientRedirect
    );
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
          baseUrl={versionUrl(this.props.a)}
          transform={transformA}
        />
        <SandboxedHtml
          html={this.props.diffData.insertions}
          baseUrl={versionUrl(this.props.b)}
          transform={transformB}
        />
      </div>
    );
  }
}
