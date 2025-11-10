import { parseMediaType } from '../../scripts/media-type';
import { humanReadableSize } from '../../scripts/formatters';
import styles from './file-preview.css';

/**
 * @typedef {Object} FilePreviewProps
 * @property {Version} version
 */

/**
 * Display basic information about a non-renderable file.
 *
 * @param {FilePreviewProps} props
 */
export default function FilePreview ({ version }) {
  const mediaType = parseMediaType(version.media_type);
  const fileName = extractFileName(version.url);
  const fileSize = formatFileSize(version.content_length);
  return (
    <div className={styles.filePreview}>
      <div className={styles.filePreviewInfo}>
        <h3 className={styles.filePreviewTitle}>File Information</h3>
        <div className={styles.filePreviewDetails}>
          <div className={styles.filePreviewDetail}>
            <strong>File Name:</strong> {fileName || version.url}
          </div>
          <div className={styles.filePreviewDetail}>
            <strong>Media Type:</strong> {mediaType.essence}
          </div>

          <div className={styles.filePreviewDetail}>
            <strong>Size:</strong> {fileSize ? fileSize : 'Unknown'} :
          </div>
          {version.body_hash && (
            <div className={styles.filePreviewDetail}>
              <strong>Hash:</strong>
              <code className={styles.filePreviewHash}>{version.body_hash}</code>
            </div>
          )}
        </div>
        <div className={styles.filePreviewActions}>
          <a
            href={version.body_url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.filePreviewView}
          >
            View Raw File
          </a>
        </div>
      </div>
      <div className={styles.filePreviewWarning}>
        <p>
          <strong>Note:</strong> This file type cannot be rendered inline.
          The above information shows basic file metadata. Use the button above to view/download.
        </p>
      </div>
    </div>
  );
}

/**
 * Extract a filename from a URL. This essentially gives you the final
 * component of the URL's path. Returns null if the URL does not include
 * anything that that can be treated as a file name.
 * @param {string} url
 * @returns {string|null}
 */
const extractFileName = (url) => {
  if (!url) return null;

  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const filename = pathname.split('/').pop();
    return filename || null;
  }
  catch (e) {
    console.warn('Failed to parse URL for filename extraction:', e);
    return null;
  }
};

/**
 * Format file size for display
 * @param {number} content_length
 * @returns {string|null}
 */
const formatFileSize = (content_length) => {
  if (typeof content_length === 'number') {
    return humanReadableSize(content_length);
  }

  return null;
};
