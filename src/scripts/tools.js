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
      const redirects = version.source_metadata.redirects;
      url = redirects[redirects.length - 1];
    }
  }

  return url;
}
