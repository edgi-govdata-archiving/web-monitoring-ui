import { versionUrl } from './tools';

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
    // In some rare instances, there is old, messy version data from Versionista
    // that doesn't have a URL for the version, so fall back to page URL. :(
    const url = versionUrl(version) || page.url;
    const timestamp = createWaybackTimestamp(version.capture_time);
    document.querySelectorAll('link[rel="stylesheet"]').forEach(node => {
      for (const attribute of ['href', 'data-href']) {
        const value = node.getAttribute(attribute);
        if (value) {
          node.setAttribute(attribute, createWaybackUrl(value, timestamp, url));
        }
      }
    });
    document.querySelectorAll('script[src],img[src]').forEach(node => {
      node.src = createWaybackUrl(node.getAttribute('src'), timestamp, url);
    });
    // TODO: handle <picture> with all its subelements
    // TODO: SVG <use> directives
    // TODO: video/audio (similar structure to <picture>)

    return document;
  };
}

export function managedScrolling (identifier) {
  const origin = window.origin;
  return (document) => {
    markScrollLandmarks(document);

    if (!document.head) {
      const head = document.createElement('head');
      const firstChild = document.documentElement.firstChild;
      if (firstChild) {
        document.documentElement.insertBefore(head, firstChild);
      }
      else {
        document.documentElement.appendChild(head);
      }
    }

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.innerHTML = `(${inPageScrollModule})('${identifier}', '${origin}');`;
    document.head.appendChild(script);
    return document;
  };
}

// ---------------------- Support Functions -----------------------------

/**
 * Find elements that are usable as scrolling landmarks and mark them in the
 * DOM as such. When syncing scrolling in side-by-side views, we use these
 * landmarks to denote the scroll postion (landmark X, offset to landmark X+1).
 * This lets synced scrolling keep related parts of the page side-by-side even
 * when big changes one side have altered their locations.
 *
 * When the pages are live, `inPageScrollModule` (inserted into the pages
 * themselves) finds these landmarks and their positions on screen.
 *
 * TODO: Ideally we'd use the changes themselves as landmarks and not need this,
 * but the differ needs to be changed to output placeholders for the insertions
 * on the deletions side (and vice-versa), since a usable landmark has to be
 * present in both views we are syncing.
 *
 * @param {Document} document
 */
function markScrollLandmarks (document) {
  const candidates = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6,.h1,.h2,.h3,.h4,.h5,.h6')];
  let index = 0;
  for (const e of candidates) {
    const noChanges = !e.querySelector('.wm-diff') && !e.matches(':is(.wm-diff *)');
    const text = e.textContent.trim().replace(/[\s\n]+/, '');

    if (noChanges && text) {
      // This element should be present in some form on both sides, and is
      // usable as a landmark.
      e.classList.add('wm-scroll-landmark');
      e.setAttribute('wm-scroll-landmark', index);
      index++;
    }
  }
}

function inPageScrollModule (identifier, appOrigin) {
  // Tracks whether we are currently setting the scroll position. If true, then
  // we can ignore scroll events.
  let __wm_autoScrolling = false;
  let __wm_scrollLandmarks = [];

  window.addEventListener('scroll', (e) => {
    //console.log('SCROLL EVENT in frame ${identifier}, auto:', __wm_autoScrolling, e);
    if (__wm_autoScrolling) {
      __wm_autoScrolling = false;
      return;
    }

    let anchorText = '<start>';
    let nextText = '<end>';
    const y = window.scrollY;
    let anchorY = 0;
    let nextY = window.scrollMaxY;
    let landmarkId = -1;
    let nextLandmark = __wm_scrollLandmarks.find(l => l.y > y && l.usable);
    if (nextLandmark) {
      nextY = nextLandmark.y;
      nextText = nextLandmark.text;
      for (let i = nextLandmark.id - 1; i >= 0; i--) {
        const landmark = __wm_scrollLandmarks[i];
        if (landmark.usable) {
          landmarkId = landmark.id;
          anchorY = landmark.y;
          anchorText = landmark.text;
          break;
        }
      }
      // if (nextLandmark.id > 0) {
      //   const landmark = __wm_scrollLandmarks[nextLandmark.id - 1];
      //   landmarkId = landmark.id;
      //   anchorY = landmark.y;
      //   anchorText = landmark.text;
      // }
    }
    else if (__wm_scrollLandmarks.length) {
      for (let i = __wm_scrollLandmarks.length - 1; i >= 0; i--) {
        const landmark = __wm_scrollLandmarks[i];
        if (landmark.usable) {
          landmarkId = landmark.id;
          anchorY = landmark.y;
          anchorText = landmark.text;
          break;
        }
      }
      // const landmark = __wm_scrollLandmarks.at(-1);
      // landmarkId = landmark.id;
      // anchorY = landmark.y;
      // anchorText = landmark.text;
    }

    console.log(`SCROLL CALC: anchorY=${anchorY}, y=${y}, nextY=${nextY} (anchor: "${anchorText}", next: "${nextText}")`, __wm_scrollLandmarks);

    window.top.postMessage({
      from: identifier,
      type: '__wm_scroll',
      position: { x: window.scrollX, y: window.scrollY },
      landmark: landmarkId,
      offset: (y - anchorY) / (nextY - anchorY)
    }, appOrigin);
  });

  window.addEventListener('message', (event) => {
    if (event.data.type === '__wm_scroll_to') {
      updateScrollLandmarks();
      //console.log('RECEIVED scroll command in ${identifier}');
      let x = event.data.position.x;
      let y = event.data.position.y;

      let useLandmarks = true;
      let anchorY = 0;
      if (event.data.landmark > -1) {
        const landmark = __wm_scrollLandmarks[event.data.landmark];
        if (landmark) {
          anchorY = landmark.y;
        }
        else {
          useLandmarks = false;
          console.warn(`Could not find scroll landmark in ${identifier}, falling back to literal position`);
        }
      }
      if (useLandmarks) {
        let nextY = window.scrollMaxY;
        for (let i = event.data.landmark + 1; i < __wm_scrollLandmarks.length; i++) {
          const nextLandmark = __wm_scrollLandmarks[i];
          if (nextLandmark.usable) {
            nextY = nextLandmark.y;
            break;
          }
        }
        y = anchorY + event.data.offset * (nextY - anchorY);
        // const nextLandmark = __wm_scrollLandmarks[event.data.landmark + 1];
        // const nextY = nextLandmark?.y ?? window.scrollMaxY;
        // y = anchorY + event.data.offset * (nextY - anchorY);
      }

      __wm_autoScrolling = true;
      window.scrollTo({ left: x, top: y, behavior: 'instant' });
    }
  });

  function getScrollLandmarks () {
    // const rootBounds = document.documentElement.getBoundingClientRect();
    const baseX = window.scrollX;
    const baseY = window.scrollY;
    const result = Array.from(document.querySelectorAll('[wm-scroll-landmark]'))
      .map(node => {
        const id = parseInt(node.getAttribute('wm-scroll-landmark'), 10);
        if (isNaN(id)) return null;

        const bounds = node.getBoundingClientRect();
        const x = bounds.left + baseX;
        const y = bounds.top + baseY;
        const usable = (
          bounds.width > 0
          && bounds.height > 0
          && x + bounds.width > 0
          && y + bounds.height > 0
        );

        return {
          id,
          // x: bounds.left - rootBounds.left,
          // y: bounds.top - rootBounds.top,
          // x: bounds.left + baseX,
          // y: bounds.top + baseY,
          x,
          y,
          usable,
          text: node.textContent.trim().replace(/[\s\n]+/g, ' '),
        };
      })
      .filter(Boolean);
    // result.push()
    if (result.some((x, index) => x.id !== index)) {
      console.error(`SCROLL LANDMARK IDS OUT OF SYNC in ${identifier}:`, result);
    }
    return result;
  }

  let lastUpdate = 0;
  let updateTimer = null;
  function updateScrollLandmarks () {
    clearTimeout(updateTimer);
    const now = Date.now();
    if (now - lastUpdate < 1000) {
      updateTimer = setTimeout(updateScrollLandmarks, 1000 - (now - lastUpdate));
      return;
    }
    lastUpdate = now;
    console.log(`Scroll landmakr update in ${identifier}`);
    __wm_scrollLandmarks = getScrollLandmarks();
    // window.top.postMessage({
    //   from: identifier,
    //   type: '__wm_scroll_landmarks',
    //   landmarks: getScrollLandmarks()
    // });
  }

  // TODO: update and send landmarks at appropriate times:
  // - immediately
  // - on DOM mutation
  // - after load/error events
  // - after page load

  updateScrollLandmarks();
  window.addEventListener('load', updateScrollLandmarks);
  document.addEventListener('load', updateScrollLandmarks, true);
  // document.addEventListener('error', updateScrollLandmarks, true);
  document.addEventListener('DOMContentLoaded', updateScrollLandmarks);
  // document.addEventListener('DOMContentLoaded', () => {
  //   setInterval(updateScrollLandmarks, 10000);
  //   // const observer = new MutationObserver(updateScrollLandmarks);
  //   // observer.observe(document.body, { subtree: true, childList: true, attributes: true });
  // });

}

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
