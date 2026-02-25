export const NON_USER_TAGS = ['site:', '2l-domain:', 'domain:'];

export function removeNonUserTags (tags) {
  return tags.filter(tag =>
    !NON_USER_TAGS.some(prefix => tag.name.startsWith(prefix))
  );
}

/**
 * Check whether a string is a valid URL.
 * @param {string} url
 * @returns {boolean}
 */
export function isValidUrl (url) {
  return typeof url === 'string' && /^[\w+-]+:\/\/[^/]+(\/[^?#]*)?(\?[^#]*)?(#.*)?$/.test(url);
}

/**
 * Get the URL that a version's body came from. If a version included redirects,
 * then its `url` property won't corresponded with the URL the response body
 * was rendered from. This gets the final target URL of all redirects, if there
 * were any, and otherwise returns the version's `url` property.
 * @param {Version} version
 * @returns {string}
 */
export function versionUrl (version) {
  let url = version.url;

  if (version.source_metadata) {
    if (version.source_metadata.redirected_url) {
      url = version.source_metadata.redirected_url;
    }
    else if (version.source_metadata.redirects) {
      // Filter out malformed entries that aren't valid URLs.
      // (Some old Versionista versions have bad data here.)
      const redirects = version.source_metadata.redirects.filter(isValidUrl);
      if (redirects.length > 0) {
        url = redirects[redirects.length - 1];
      }
    }
  }

  return url;
}
