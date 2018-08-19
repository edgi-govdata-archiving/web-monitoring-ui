export function removeStyleAndScript (document) {
  // Stylesheets and scripts
  document.querySelectorAll('link[rel="stylesheet"], style, script').forEach(node => {
    const isDiffNode = node.id.startsWith('wm-') ||
      Array.from(node.classList).some(name => name.startsWith('wm-'));

    if (!isDiffNode) {
      node.remove();
    }
  });

  // Inline style attributes
  document.querySelectorAll('[style]').forEach(node => node.removeAttribute('style'));

  return document;
}
