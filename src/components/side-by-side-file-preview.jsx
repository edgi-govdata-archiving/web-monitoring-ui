import { Component } from 'react';
import FilePreview from './file-preview/file-preview';
import './file-preview.css';

/**
 * @typedef {Object} SideBySideFilePreviewProps
 * @property {DiffData} diffData Object containing diff to render and its metadata
 * @property {Page} page The page this diff pertains to
 * @property {Version} a
 * @property {Version} b
 */

/**
 * Display two non-renderable file previews, side-by-side.
 *
 * @class SideBySideFilePreview
 * @extends {Component}
 * @param {SideBySideFilePreviewProps} props
 */
export default class SideBySideFilePreview extends Component {
  render () {
    return (
      <div className="side-by-side-file-preview">
        <div className="side-by-side-file-preview__version">
          <h3 className="side-by-side-file-preview__version-title">From Version</h3>
          <FilePreview
            page={this.props.page}
            version={this.props.a}
            content={this.props.diffData.rawA}
          />
        </div>

        <div className="side-by-side-file-preview__version">
          <h3 className="side-by-side-file-preview__version-title">To Version</h3>
          <FilePreview
            page={this.props.page}
            version={this.props.b}
            content={this.props.diffData.rawB}
          />
        </div>
      </div>
    );
  }
}
