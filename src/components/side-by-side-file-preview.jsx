import { Component } from 'react';
import FilePreview from './file-preview/file-preview';

/**
 * @typedef {Object} SideBySideFilePreviewProps
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
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div>
          <h3>From Version</h3>
          <FilePreview
            version={this.props.a}
          />
        </div>

        <div>
          <h3>To Version</h3>
          <FilePreview
            version={this.props.b}
          />
        </div>
      </div>
    );
  }
}
