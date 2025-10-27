import FilePreview from '../file-preview/file-preview';
import styles from './side-by-side-file-preview.css';

/**
 * @typedef {Object} SideBySideFilePreviewProps
 * @property {Version} a
 * @property {Version} b
 */

/**
 * Display two non-renderable file previews, side-by-side.
 *
 * @param {SideBySideFilePreviewProps} props
 */
export default function SideBySideFilePreview ({ a, b }) {
  return (
    <div className={styles.sideBySideFilePreviewContainer}>
      <div>
        <h3>From Version</h3>
        <FilePreview version={a} />
      </div>

      <div>
        <h3>To Version</h3>
        <FilePreview version={b} />
      </div>
    </div>
  );
}