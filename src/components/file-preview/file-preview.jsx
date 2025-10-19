import { Component } from 'react';
import { parseMediaType } from '../../scripts/media-type';
import { dateFormatter } from '../../scripts/formatters';
import './file-preview.css';


/**
 * @typedef {Object} FilePreviewProps
 * @property {Page} page The page this diff pertains to
 * @property {Version} version
 */

/**
 * Display basic information about a non-renderable file.
 *
 * @class FilePreview
 * @extends {Component}
 * @param {FilePreviewProps} props
 */
export default class FilePreview extends Component {
  render () {
    const { version, page } = this.props;
    const mediaType = parseMediaType(version.media_type);
    const fileName = this.extractFileName(version.body_url || page.url);
    const fileSize = this.formatFileSize(version.content_length);
    return (
      <div className="file-preview">
        <div className={`file-preview__info`}>
          <h3 className="file-preview__title">File Information</h3>

          <div className="file-preview__details">
            <div className="file-preview__detail">
              <strong>File Name:</strong> {fileName || version.url}
            </div>

            <div className="file-preview__detail">
              <strong>Media Type:</strong> {mediaType.essence}
            </div>

            {fileSize && (
              <div className="file-preview__detail">
                <strong>Size:</strong> {fileSize}
              </div>
            )}

            {version.body_hash && (
              <div className="file-preview__detail">
                <strong>Hash:</strong>
                <code className="file-preview__hash">{version.body_hash}</code>
              </div>
            )}

            {version.capture_time && (
              <div className="file-preview__detail">
                <strong>Captured:</strong> {dateFormatter.format(new Date(version.capture_time))}
              </div>
            )}
          </div>

          <div className="file-preview__actions">
            <a
              href={version.body_url}
              target="_blank"
              rel="noopener noreferrer"
              className={`file-preview__view`}
            >
              View Raw File
            </a>
            {' '}
          </div>
        </div>

        <div className="file-preview__warning">
          <p>
            <strong>Note:</strong> This file type cannot be rendered inline.
            The above information shows basic file metadata. Use the button above to view/download.
          </p>
        </div>
      </div>
    );
  }

  /**
   * Extract a filename from a URL
   * @private
   * @param {string} url
   * @returns {string|null}
   */
  extractFileName (url) {
    if (!url) return null;

    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const filename = pathname.split('/').pop();
      return filename || null;
    }
    catch (e) {
      // If URL parsing fails, try simple string extraction
      console.warn('Failed to parse URL for filename extraction:', e);
      const parts = url.split('/');
      return parts[parts.length - 1];
    }
  }

  /**
   * Format file size for display
   * @private
   * @returns {string|null}
   */
  formatFileSize (content_length) {
    // Use version.content_length if available
    if (typeof content_length === 'number') {
      return this.humanReadableSize(content_length);
    }
    return null;
  }

  /**
   * Convert bytes to human readable format
   * @private
   * @param {number} bytes
   * @returns {string}
   */
  humanReadableSize (bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const cappedIndex = Math.min(i, sizes.length - 1);
    const sizeUnit = sizes[cappedIndex];

    return parseFloat((bytes / Math.pow(k, cappedIndex)).toFixed(2)) + ' ' + sizeUnit;
  }
}
