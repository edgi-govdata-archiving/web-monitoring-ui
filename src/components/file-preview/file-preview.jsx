import { Component } from 'react';
import { parseMediaType } from '../../scripts/media-type';
import { dateFormatter } from '../../scripts/formatters';
import styles from './file-preview.css';

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
      <div className={styles['file-preview']}>
        <div className={styles['file-preview-info']}>
          <h3 className={styles['file-preview-title']}>File Information</h3>

          <div className={styles['file-preview-details']}>
            <div className={styles['file-preview-detail']}>
              <strong>File Name:</strong> {fileName || version.url}
            </div>

            <div className={styles['file-preview-detail']}>
              <strong>Media Type:</strong> {mediaType.essence}
            </div>

            {fileSize && (
              <div className={styles['file-preview-detail']}>
                <strong>Size:</strong> {fileSize}
              </div>
            )}

            {version.body_hash && (
              <div className={styles['file-preview-detail']}>
                <strong>Hash:</strong>
                <code className={styles['file-preview-hash']}>{version.body_hash}</code>
              </div>
            )}

            {version.capture_time && (
              <div className={styles['file-preview-detail']}>
                <strong>Captured:</strong> {dateFormatter.format(new Date(version.capture_time))}
              </div>
            )}
          </div>

          <div className={styles['file-preview-actions']}>
            <a
              href={version.body_url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles['file-preview-view']}
            >
              View Raw File
            </a>
            {' '}
          </div>
        </div>

        <div className={styles['file-preview-warning']}>
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