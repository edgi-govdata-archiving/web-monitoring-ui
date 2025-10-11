import { Component } from 'react';
import { parseMediaType } from '../../scripts/media-type';
import { dateFormatter } from '../../scripts/formatters';
import styles from '../css/base.css';
import './file-preview.css';


/**
 * @typedef {Object} FilePreviewProps
 * @property {Page} page The page this diff pertains to
 * @property {Version} version
 * @property {string} [content] Optional content string (for display purposes)
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
    const fileSize = this.formatFileSize(version.body_hash, this.props.content);

    return (
      <div className="file-preview">
        <div className={`file-preview__info ${styles.card}`}>
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
                <strong>Captured:</strong> {dateFormatter.format(version.capture_time)}
              </div>
            )}
          </div>

          <div className="file-preview__actions">
            <a
              href={version.body_url}
              target="_blank"
              rel="noopener noreferrer"
              className={`file-preview__download ${styles.btn} ${styles.btnPrimary}`}
            >
              Download File
            </a>
          </div>
        </div>

        <div className="file-preview__warning">
          <p>
            <strong>Note:</strong> This file type cannot be rendered inline.
            The above information shows basic file metadata. Use the button above to download.
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
      const parts = url.split('/');
      return parts[parts.length - 1] || null;
    }
  }

  /**
   * Format file size for display
   * @private
   * @param {string} hash
   * @param {string} content
   * @returns {string|null}
   */
  formatFileSize (hash, content) {
    // If we have content, use its length
    if (content && typeof content === 'string') {
      const bytes = new Blob([content]).size;
      return this.humanReadableSize(bytes);
    }

    // For now, we don't have a reliable way to get file size from just the hash
    // This could be enhanced in the future if size information is available
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

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
