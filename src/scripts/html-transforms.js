export function compose (...transforms) {
  transforms = transforms.filter(transform => !!transform);
  if (transforms.length === 0) {
    return x => x;
  }

  return (input) => {
    transforms.reduce((output, transform) => {
      return transform(output);
    }, input);
  };
}

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

/**
 *
 * @param {WebMonitoringDb.Page} page
 * @param {WebMonitoringDb.Version} version
 */
export function loadSubresourcesFromWayback (page, version) {
  return document => {
    const timestamp = createWaybackTimestamp(version.capture_time);
    document.querySelectorAll('link[rel="stylesheet"]').forEach(node => {
      node.href = createWaybackUrl(node.getAttribute('href'), timestamp, page.url);
    });

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
