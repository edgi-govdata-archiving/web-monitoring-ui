/*eslint-env commonjs*/

exports.removeStyleAndScript = document => {
  document.querySelectorAll('link[rel="stylesheet"], style, script').forEach(node => {
    const isDiffNode = node.id.startsWith('wm-') ||
      Array.from(node.classList).some(name => name.startsWith('wm-'));

    if (!isDiffNode) {
      node.remove();
    }
  });

  return document;
};
