import { Component } from 'react';
import SandboxedHtml from './sandboxed-html';
import {
  addTargetBlank,
  compose,
  loadSubresourcesFromWayback,
  removeClientRedirect,
  removeStyleAndScript,
} from '../scripts/html-transforms';
import { htmlType, parseMediaType, unknownType } from '../scripts/media-type';

/**
 * @typedef {Object} SideBySideRawVersionsProps
 * @property {DiffData} diffData Object containing diff to render and its metadata
 * @property {Page} page The page this diff pertains to
 * @property {Version} a
 * @property {Version} b
 * @property {boolean} diffSettings
 */

/**
 * Display two versions of a page, side-by-side.
 *
 * @class SideBySideRawVersions
 * @extends {Component}
 * @param {SideBySideRawVersionsProps} props
 */
export default class SideBySideRawVersions extends Component {
  render () {
    return (
      <div className="side-by-side-render">
        {renderVersion(this.props.page, this.props.a, this.props.diffData.rawA, this.props.diffSettings)}
        {renderVersion(this.props.page, this.props.b, this.props.diffData.rawB, this.props.diffSettings)}
      </div>
    );
  }
}

function renderVersion (page, version, content, settings) {
  // TODO: should probably cache the parsed media type on version so we don't
  // keep re-parsing it.
  let mediaType = null;
  if (version.media_type) {
    mediaType = parseMediaType(version.media_type);
  }
  else if (content) {
    mediaType = /^[\s\n\r]*</.test(content) ? htmlType : unknownType;
  }

  if (content != null && mediaType.equals(htmlType)) {
    settings ||= {};
    const baseTransform = compose(
      settings.removeFormatting && removeStyleAndScript,
      addTargetBlank,
      removeClientRedirect,
      settings.useWaybackResources && loadSubresourcesFromWayback(
        page,
        version,
      ),
    );

    return <SandboxedHtml html={content} baseUrl={page.url} transform={baseTransform} />;
  }

  return <iframe src={version.body_url} />;
}
