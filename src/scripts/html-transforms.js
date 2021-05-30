/**
 * HtmlTransforms are functions that take an HTML Document and modify it in
 * some useful way, such as removing scripts.
 * @typedef {(document: HTMLDocument) => HTMLDocument} HtmlTransform
 */

/**
 * Takes several transforms and returns a new function that takes an html document,
 * runs the transform functions on it, and returns the resulting document.
 * @param {...HtmlTransform} The transforms to combine.
 * @returns {HtmlTransform}
 */
export function compose (...transforms) {
  transforms = transforms.filter(transform => !!transform);
  if (transforms.length === 0) {
    return x => x;
  }

  return (input) => {
    return transforms.reduce((output, transform) => {
      return transform(output);
    }, input);
  };
}

/**
 * Takes an html document, removes all the stylesheets and scripts from
 * the document. If any of them have a class or id that starts with 'wm-',
 * it keeps them as an exception.
 * Returns the resulting document.
 * @param {HTMLDocument} document The html document to change.
 * @returns {HTMLDocument}
 */
export function removeStyleAndScript (document) {
  // Stylesheets and scripts
  document.querySelectorAll('link[rel*="stylesheet"], style, script').forEach(node => {
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

/**
 * Removes any client-side redirects we can find and places a notice on the
 * page about the redirect.
 * @param {HTMLDocument} document The HTML document to change.
 * @returns {HTMLDocument}
 */
export function removeClientRedirect (document) {
  const metaRefresh = document.querySelector('meta[http-equiv="refresh"]');
  if (metaRefresh) {
    const targetMatch = (metaRefresh.content || '').match(/^\s*\d+;\s*url=(.*)$/);
    if (targetMatch) {
      metaRefresh.remove();
      const target = targetMatch[1];

      const banner = document.createElement('div');
      banner.className = 'wm-redirect-banner';
      Object.assign(banner.style, {
        background: '#fcf8e3',
        border: '1px solid #ddd',
        borderRadius: '5px',
        margin: '1.5em 1em',
        padding: '1em'
      });
      banner.innerHTML = `
        <h1>Client-Side Redirect</h1>
        <p>
          This page contains an automatic redirect that runs
          <em style="font-style: italic !important;">after</em> the page loads.
          Because the redirect happens after the page loads instead of before,
          we can’t show a highlighted comparison of page.
        </p>
        <p>
          This page redirects to:
          <a href="${target}">
            <code style="font-family: monospace !important">
              ${escapeHtml(target)}
            </code>
          </a>
        </p>
      `;

      document.body.prepend(banner);
    }

  }

  return document;
}

/**
 * Prevents navigation from within a diff by forcing links to open in a new
 * tab when clicked. This helps ensure we don’t get in a state where one side
 * of a side-by-side diff has been navigated and viewer does not realize they
 * are no longer actually looking at a *diff*.
 *
 * NOTE: This requires the iframe displaying the diff to allow popups with the
 * `sandbox="allow-popups"` attribute.
 * @param {HTMLDocument} document The html document to transform.
 * @returns {HTMLDocument}
 */
export function addTargetBlank (document) {
  // Add target="_blank" to all <a>tags
  document.querySelectorAll('a').forEach(node => {
    node.setAttribute('target', '_blank');
  });
  return document;
}

/**
 * Creates a transform that will rewrite subresource URLs to point to the
 * Wayback Machine. This is useful when we have snapshots of the page itself,
 * but not its subresources. It won't always work (Wayback won't always have
 * a snapshot of the subresource from a similar point in time), but it'll work
 * a lot better than just pointing to the original URL, which might be missing
 * or significantly altered by the time a diff is viewed.
 *
 * Note this *creates* the transform and is not the transform itself (because
 * the transform must be custom to a particular source URL and point in time).
 * @param {WebMonitoringDb.Page} page
 * @param {WebMonitoringDb.Version} version
 */
export function loadSubresourcesFromWayback (page, version) {
  return document => {
    const timestamp = createWaybackTimestamp(version.capture_time);
    document.querySelectorAll('link[rel="stylesheet"]').forEach(node => {
      node.href = createWaybackUrl(node.getAttribute('href'), timestamp, page.url);
    });
    document.querySelectorAll('script[src],img[src]').forEach(node => {
      node.src = createWaybackUrl(node.getAttribute('src'), timestamp, page.url);
    });
    // TODO: handle <picture> with all its subelements
    // TODO: SVG <use> directives
    // TODO: video/audio (similar structure to <picture>)

    return document;
  };
}


// ---------------------- Support Functions -----------------------------

/**
 * Convert a Date object to to a Wayback-Machine style timestamp string.
 * @param {Date} date A JS date object to convert
 * @returns String
 */
function createWaybackTimestamp (date) {
  return '' + date.getUTCFullYear()
    + twoDigit(date.getUTCMonth() + 1)
    + twoDigit(date.getUTCDate())
    + twoDigit(date.getUTCHours())
    + twoDigit(date.getUTCMinutes())
    + twoDigit(date.getUTCSeconds());
}

const PROTOCOL_PATTERN = /^[^/]+:\/\//;

/**
 * Create a URL that points to a Wayback Machine-archived version of another
 * URL near a particular date.
 * @param {String} originalUrl URL of the resource to get from the Wayback Machine
 * @param {Date|String} timestamp Date of the
 */
function createWaybackUrl (originalUrl, timestamp, baseUrl) {
  if (typeof timestamp !== 'string') {
    timestamp = createWaybackTimestamp(timestamp);
  }

  const url = resolveUrl(originalUrl, baseUrl);
  return `https://web.archive.org/web/${timestamp}id_/${url}`;
}

/**
 * Resolve a full URL from a relative one.
 * @param {String} url The URL to resolve
 * @param {String} baseUrl The base URL to resolve from
 */
function resolveUrl (url, baseUrl) {
  if (url.startsWith('//')) {
    return `https:${url}`;
  }
  else if (!PROTOCOL_PATTERN.test(url)) {
    const base = new URL(baseUrl);
    if (url.startsWith('/')) {
      return `${base.origin}${url}`;
    }
    else {
      const path = base.pathname.split('/').slice(0, -1).join('/');
      return `${base.origin}${path}/${url}`;
    }
  }
  return url;
}

function twoDigit (number) {
  return number.toString().padStart(2, '0');
}

function escapeHtml (text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
