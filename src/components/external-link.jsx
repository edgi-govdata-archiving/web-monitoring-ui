/**
 * Create a link that opens in a new tab/window with no referer information.
 * @param {any} props
 * @param {string} props.href URL of the link
 * @returns {React.Component}
 */
export default function ExternalLink ({ href, children, ...otherProps }) {
  return (
    <a href={href} target="_blank" rel="noopener" { ...otherProps }>
      {children || href}
    </a>
  );
}
