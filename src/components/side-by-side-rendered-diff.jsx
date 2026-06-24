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
    this.resetLandmarks();
  }

  resetLandmarks () {
    this._landmarks = { a: [], b: [] };
  }

  componentDidMount () {
    window.addEventListener('message', this._receiveWindowMessage);
    this.resetLandmarks();
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
          ref={node => { this._htmlViewA = node; }}
        />
        <SandboxedHtml
          html={this.props.diffData.insertions}
          baseUrl={versionUrl(this.props.b)}
          transform={transformB}
          ref={node => { this._htmlViewB = node; }}
        />
      </div>
    );
  }

  /**
   * Handle `message` events sent to this window via `postMessage()`. This just
   * dispatches to the appropriate handler based on the message type.
   * @param {MessageEvent} event
   */
  _receiveWindowMessage (event) {
    if (!this.props.syncScrolling) return;

    const method = this[`_receive${event.data.type}`];
    if (method) method.call(this, event);
  }

  /**
   * Broker scroll events between the two pages. When one page scrolls, it will
   * post a message with scroll position info. We forward that to the other
   * page so it can update its scroll position to match.
   * @param {MessageEvent} event
   */
  _receive__wm_scroll (event) {
    const target = event.data.from === 'A' ? this._htmlViewB : this._htmlViewA;
    if (target) {
      target.postMessage({
        ...event.data,
        type: '__wm_scroll_to',
      });
    }
    else {
      console.error(
        'Could not find target SandboxedHtml to forward scroll command to!'
      );
    }
  }

  /**
   * Find common scroll landmarks between pages and broadcast the common
   * landmarks back to them.
   *
   * When the pages update their list of landmarks (due to DOM mutations,
   * events, etc.), they post their landmarks via the "__wm_scroll_landmarks"
   * event. We find the intersection between both page's landmarks and send
   * each of them that common list. This makes scrolling smoother, since they
   * can each attempt to only use landmarks that will be present in the other.
   * @param {MessageEvent} event
   */
  _receive__wm_scroll_landmarks (event) {
    if (!['A', 'B'].includes(event.data.from)) {
      console.error(`Got landmark update from unknown frame "${event.data.from}"`);
      return;
    }

    this._landmarks[event.data.from.toLowerCase()] = event.data.landmarks;
    if (this._landmarks.a.length && this._landmarks.b.length) {
      const commonEvent = {
        type: '__wm_scroll_landmarks_common',
        landmarks: this._landmarks.a.filter(id => this._landmarks.b.includes(id)),
      };
      this._htmlViewA.postMessage(commonEvent);
      this._htmlViewB.postMessage(commonEvent);
    }
  }
}
