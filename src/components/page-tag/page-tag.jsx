import styles from './page-tag.css';

/**
 * Helper component for rendering tags.
 */
export default function PageTag ({ tag }) {
  let prefix = '';
  let name = tag.name;
  const colonIndex = name.indexOf(':');
  if (colonIndex > -1) {
    prefix = name.slice(0, colonIndex + 1);
    name = name.slice(colonIndex + 1);
  }

  let prefixNode;
  if (prefix) {
    prefixNode = <span className={styles.prefix}>{prefix}</span>;
  }

  return (
    <span className={styles.pageTag}>
      {prefixNode}
      {name}
    </span>
  );
}
