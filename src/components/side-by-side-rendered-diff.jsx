import { Component } from 'react';
import {
  removeStyleAndScript,
  removeClientRedirect,
  loadSubresourcesFromWayback,
  managedScrolling,
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
 * @property {boolean} syncScrolling
 */

/**
 * Display two versions of a page, side-by-side.
 *
 * @class SideBySideRenderedDiff
 * @extends {Component}
 * @param {SideBySideRenderedDiffProps} props
 */
export default class SideBySideRenderedDiff extends Component {
  constructor (props) {
    super(props);
    this._receiveWindowMessage = this._receiveWindowMessage.bind(this);
    this._htmlViewA = null;
    this._htmlViewB = null;
  }

  componentDidMount () {
    window.addEventListener('message', this._receiveWindowMessage);
  }

  componentWillUnmount () {
    window.removeEventListener('message', this._receiveWindowMessage);
  }

  render () {
    const baseTransform = compose(
      this.props.removeFormatting && removeStyleAndScript,
      addTargetBlank,
      removeClientRedirect
    );
    let transformA = baseTransform;
    let transformB = baseTransform;
    transformA = compose(transformA, managedScrolling('A'));
    transformB = compose(transformB, managedScrolling('B'));
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
          ref={node => this._htmlViewA = node}
        />
        <SandboxedHtml
          html={this.props.diffData.insertions}
          baseUrl={versionUrl(this.props.b)}
          transform={transformB}
          ref={node => this._htmlViewB = node}
        />
      </div>
    );
  }

  /**
   * Broker scroll events between the two pages. When one page scrolls, it will
   * post a message with scroll info. We basically just forward that to the
   * other page so it can update its scroll position to match.
   * @param {MessageEvent} event
   */
  _receiveWindowMessage (event) {
    if (!this.props.syncScrolling) return;
    if (event.data.type !== '__wm_scroll') return;

    console.log('Scroll update:', event.data);
    const target = event.data.from === 'A' ? this._htmlViewB : this._htmlViewA;
    if (target) {
      target.postMessage({
        ...event.data,
        type: '__wm_scroll_to',
      });
    }
    else {
      console.error('Could not find target SandboxedHtml to send scroll command to.');
    }
  }
}
