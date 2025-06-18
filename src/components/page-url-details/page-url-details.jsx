import ExternalLink from '../external-link';
import styles from './page-url-details.css';

/**
 * Renders a disclosure box with detailed information about the URLs of a page
 * and any two versions. Shows how the captured URL(s) differ from the page's
 * canonical URL and/or what redirects are involved.
 * @param {any} props
 * @param {Page} props.page The page to render URL details for
 * @param {Version} props.from
 * @param {Version} props.to
 * @returns {React.Component}
 */
export default function PageUrlDetails ({ page, from, to }) {
  const fromRedirects = _redirectHistoryForVersion(from);
  const toRedirects = _redirectHistoryForVersion(to);

  if (fromRedirects.join(',') === toRedirects.join(',')) {
    if (toRedirects.length > 1) {
      return (
        <details className={styles.pageUrlDetails}>
          <summary>⚠️ Captured URL Redirected Somewhere Else</summary>
          <UrlHistoryList urls={toRedirects} baseUrl={page.url} />
        </details>
      );
    }
    else if (toRedirects[0] !== page.url) {
      return (
        <details className={styles.pageUrlDetails}>
          <summary>⚠️ Captured from a different URL</summary>
          <ExternalLink href={toRedirects[0]}>
            <NaiveUrlDiff a={page.url} b={toRedirects[0]} />
          </ExternalLink>
        </details>
      );
    }
  }
  else {
    return (
      <details className={styles.pageUrlDetails}>
        <summary>⚠️ Versions come from different URLs</summary>
        <strong>From Version URL and Redirects:</strong>
        <UrlHistoryList urls={fromRedirects} baseUrl={page.url} />

        <strong>To Version URL and Redirects:</strong>
        <UrlHistoryList urls={toRedirects} baseUrl={page.url} />
      </details>
    );
  }

  return null;
}

/**
 * Renders a list of URLs where each successive URL is presumed to be a
 * redirect from the previous URL. Differences between each URL are highlighted.
 * @param {any} props
 * @param {Array<string>} props.urls List of URL + redirects
 * @param {string} [props.baseUrl] A "base" URL to highlight differences from
 *        in the first item of `props.urls`.
 * @returns {React.Component}
 */
function UrlHistoryList ({ urls, baseUrl }) {
  let previous = baseUrl ? parseUrlForDiff(baseUrl) : null;
  const diffedUrls = urls.map(url => {
    let parsed = parseUrlForDiff(url);
    const rendered = <NaiveUrlDiff a={previous} b={parsed} />;
    previous = parsed;
    return { url, parsed, rendered };
  });

  return (
    <ol className={styles.urlHistoryList}>
      {diffedUrls.map((info, index) => {
        return (
          <li key={index}>
            <ExternalLink href={info.url}>{info.rendered}</ExternalLink>
            {index + 1 < urls.length ? <RedirectIcon /> : null}
          </li>
        );
      })}
    </ol>
  );
}

/**
 * Renders an icon indicating a redirect.
 * @returns {React.Component}
 */
function RedirectIcon () {
  return (
    <i
      className="fa fa-no-hover fa-right-icon fa-angle-right"
      title="Redirects to"
    />
  );
}

/**
 * Renders a URL, highlighting the components that differ from another URL.
 * @param {any} props
 * @param {string|UrlData} [props.a] The base URL to compare to
 * @param {string|UrlData} props.b The URL to render.
 * @returns {React.Component}
 */
function NaiveUrlDiff ({ a, b }) {
  let aParsed = (a && typeof a === 'string') ? parseUrlForDiff(a) : a;
  let bParsed = (b && typeof b === 'string') ? parseUrlForDiff(b) : b;

  if (a && b) {
    const highlightDiff = (name) => {
      const value = bParsed[name];
      return value !== aParsed[name] ? <ins>{value}</ins> : value;
    };

    const hostDiff = naiveInsertionDiff(aParsed.host, bParsed.host);
    const renderedHost = renderDiff(hostDiff, '.');

    const pathDiff = naiveInsertionDiff(aParsed.path, bParsed.path);
    const renderedPath = renderDiff(pathDiff, ' ');
    return (
      <>
        {highlightDiff('scheme')}{' '}
        {renderedHost}{' '}
        {renderedPath}{' '}
        {highlightDiff('query')}{' '}
        {highlightDiff('hash')}
      </>
    );
  }
  else {
    return (
      <>
        {bParsed.scheme}{' '}
        {bParsed.host.join('.')}{' '}
        {bParsed.path.join(' ')}{' '}
        {bParsed.query}{' '}
        {bParsed.hash}
      </>
    );
  }
}

/**
 * Render a diff as an array of React components. Items that were inserted will
 * be wrapped with `<ins>` elements.
 * @param {Array<[number, any]>} diff
 * @param {string} [delimiter] Optional delimiter between diff items.
 * @returns {Array<string|React.Component>}
 */
function renderDiff (diff, delimiter = null) {
  const rendered = [];

  for (let i = 0; i < diff.length; i++) {
    if (delimiter != null && i > 0) rendered.push(delimiter);

    if (diff[i][0] === 0) {
      rendered.push(diff[i][1]);
    }
    else {
      rendered.push(<ins key={i}>{diff[i][1]}</ins>);
    }
  }

  return rendered;
}

/**
 * @typedef {Object} UrlData
 * @property {string} scheme The URL scheme, including the "://".
 * @property {string[]} host The "."-delimited components of the host name.
 * @property {string[]} path The "/"-delimited components of the path. Each
 *           item includes the "/" at the start.
 * @property {string} query The querystring, including the leading "?". Will be
 *           an empty string if there is no querystring in the URL.
 * @property {string} hash The hash, including the leading "#". Will be
 *           an empty string if there is no hash in the URL.
 */

const URL_PARSE_PATTERN = /^([\w+-]+:\/\/)([^/]+)(\/[^?#]*)?(\?[^#]*)?(#.*)?$/;

/**
 * Parse a URL into an object that is friendly for diffing.
 * @param {string} url
 * @returns {UrlData}
 */
function parseUrlForDiff (url) {
  let components = url.match(URL_PARSE_PATTERN);
  return {
    scheme: components[1],
    host: components[2].split('.'),
    path: (components[3] || '').slice(1).split('/').map(x => `/ ${x}`),
    query: components[4] || '',
    hash: components[5] || ''
  };
}

/**
 * Calculate a very simple diff between two lists. This only does a single,
 * forward pass, and only includes items that were unchanged or inserted (not
 * items that were deleted).
 * @param {Array<any>} listA
 * @param {Array<any>} listB
 * @returns {Array<[number, any]>}
 */
function naiveInsertionDiff (listA, listB) {
  const operations = [];
  for (let iA = 0, iB = 0; iB < listB.length; iB++) {
    const valueA = listA[iA];
    const valueB = listB[iB];
    if (valueA === valueB) {
      operations.push([0, valueB]);
      iA++;
    }
    else {
      operations.push([1, valueB]);
      // Does the current item from listA show up later in listB, implying the
      // current item in listB is an *insertion* rather than a *change*?
      if (listB.slice(iB + 1).includes(valueA)) {
        // If yes, keep our current position in listA and don't increment iA.
        // We want to hit the matching value on the next iteration.
      }
      else {
        // Otherwise, does the current item from listB show up later in listA,
        // implying we *deleted* some items from listA?
        const nextIndexInA = listA.slice(iA).indexOf(valueB);
        if (nextIndexInA > -1) {
          // If yes, skip forward in listA to jump over deleted items.
          iA += nextIndexInA + 1;
        }
        else {
          iA++;
        }
      }
    }
  }
  return operations;
}

/**
 * Get an array of all the URLs that were requested to get a version's body.
 * If the resulting array has length 1, there were no redirects.
 * @param {Version} version
 */
function _redirectHistoryForVersion (version) {
  if (!version) return [];

  // Make a copy of the redirects
  const redirects = (
    version.source_metadata && version.source_metadata.redirects || []
  ).slice();

  // Ensure it starts with the URL we tried to capture here.
  if (redirects[0] != version.url) {
    redirects.unshift(version.url);
  }

  // ...and ends with the final URL. Some versions include this, while others
  // have it in `source_metadata.redirected_url`.
  if (version.redirected_url && redirects[redirects.length - 1] !== version.redirected_url) {
    redirects.push(version.redirected_url);
  }

  // Make sure the final URL does not repeat (this happens for some).
  if (redirects[redirects.length - 1] === redirects[redirects.length - 2]) {
    redirects.pop();
  }

  return redirects;
}
