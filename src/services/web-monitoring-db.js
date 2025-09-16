import { formatDateRange } from '../scripts/db-helpers.js';
const defaultApiUrl = 'https://api.monitoring-staging.envirodatagov.org/';
const storageLocation = 'WebMonitoringDb.token';

/**
 * @typedef Version
 * @property {string} uuid
 * @property {string} page_uuid
 * @property {Date} capture_time
 * @property {string} url
 * @property {string} body_url
 * @property {string} body_hash
 * @property {number} status
 * @property {Object} headers
 * @property {number} content_length
 * @property {string} media_type
 * @property {string} title
 * @property {boolean} different
 * @property {string} source_type
 * @property {Object} source_metadata
 * @property {Date} created_at
 * @property {Date} updated_at
 */

/**
 * @typedef Page
 * @property {string} uuid
 * @property {string} url
 * @property {string} title
 * @property {Date} created_at
 * @property {Date} updated_at
 * @property {Version} [latest]
 * @property {Version[]} [versions]
 * @property {Maintainership[]} maintainers
 * @property {Tagging[]} tags
 */

/**
 * @typedef Annotation
 * @property {Object} annotation
 * @property {Object} author
 * @property {Date} created_at
 * @property {Date} updated_at
 */

/**
 * @typedef Change
 * @property {string} uuid_from
 * @property {string} uuid_to
 * @property {number} [priority]
 * @property {number} [significance]
 * @property {Object} current_annotation
 * @property {Date} created_at
 * @property {Date} updated_at
 */

/**
 * @typedef DiffData
 * @property {number} change_count
 * @property {string} diff
 * @property {string} version
 * @property {string} type
 */

/**
 * @typedef ApiResponse
 * @property {Object} [links]
 * @property {Object|Array} [data]
 * @property {Array} [errors]
 */

/**
  * @typedef Maintainership
  * @property {string} uuid
  * @property {string} name
  * @property {Date} assigned_at
  * @property {string} parent_uuid
  */

/**
 * @typedef Tagging
 * @property {string} uuid
 * @property {string} name
 * @property {Date} assigned_at
*/

/**
 * API wrapper for accessing information from the public Web Monitoring Database
 * @class WebMonitoringDb
 *
 * @param {Object} [options]
 * @param {string} [options.url] URL of the DB instance to contact.
 *   Defaults to staging.
 * @param {boolean} [options.useSavedCredentials=true] Use credentials stored
 *   in the browser's localstorage
 */
export default class WebMonitoringDb {
  /**
     * @property {Object} userdata
     * @property {string} url
     * @property {string} authToken
     * @property {boolean} isTokenVerified
     * @property {Promise} tokenVerification
     */

  constructor (options) {
    this.url = options.url || defaultApiUrl;
    if (this.url.endsWith('/')) {
      this.url = this.url.slice(0, -1);
    }

    const useSavedCredentials = options.useSavedCredentials;
    if (useSavedCredentials === true || useSavedCredentials == null) {
      this._loadToken();
      // Explicit check because https://bugs.chromium.org/p/chromium/issues/detail?id=465666
      if (this.authToken) {
        this._verifyToken(true);
      }
    }
  }

  /**
     * Log into the API. Returns a promise for user info
     * @param {string} user
     * @param {string} password
     * @returns {Promise<Object>}
     */
  logIn (user, password) {
    return fetch(this._createUrl('/users/sign_in'), {
      body: JSON.stringify({
        user: {
          email: user,
          password
        }
      }),
      headers: new Headers({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }),
      method: 'POST',
      mode: 'cors',
    })
      .then(response => response.json())
      .then(sessionData => {
        if (sessionData.error) {
          throw new Error(sessionData.error);
        }

        this.authToken = sessionData.token;
        this._saveToken(this.authToken);
        this.isTokenVerfied = true;
        this.userData = sessionData.user;
        return this.userData;
      });
  }

  /**
     * Log out of the API and dump any saved session tokens.
     */
  logOut () {
    this.authToken = null;
    this._saveToken('');
    this.userData = null;
  }

  /**
     * Determine whether this API instance is signed into the API server.
     *
     * @param {boolean} [verify=false] Check the validity of this token with
     *   API server. If the current token has never been verified, this defaults
     *   to true.
     * @returns {Promise<boolean>}
     */
  isLoggedIn (verify) {
    if (this.authToken && (verify || !this.isTokenVerfied)) {
      return this._verifyToken()
        .then(() => true)
        .catch(() => false);
    }

    return Promise.resolve(!!this.userData);
  }

  /**
     * Get pages.
     * @param {Object} [query]
     * @param {number} limitChunks
     * @returns {Promise<Page[]>}
     */
  getPages (query, limitChunks = 1) {
    const url = this._createUrl('pages', query);
    return this._getListChunks(url, parsePage, limitChunks);
  }

  /**
     * Get a single page.
     * @param {string} pageId
     * @returns {Promise<Page>}
     */
  getPage (pageId) {
    return this._request(this._createUrl(`pages/${pageId}`))
      .then(response => response.json())
      .then(throwIfError(`Could not load page: ${pageId}`))
      .then(data => parsePage(data.data));
  }

  /**
   * Get sample of versions (1 per day) for a given page. This is generally
   * much faster and more efficient than `getVersions` for pages that have a
   * lot of snapshots, like the EPA homepage.
   * @param {string} pageId
   * @param {number} limitChunks
   * @returns {Promise<Array<{time: string, version_count: number, version: Version}>>}
   */
  sampleVersions (pageId, limitChunks = 1) {
    const url = this._createUrl(`pages/${pageId}/versions/sampled`);
    return this._getListChunks(url, parseVersionSample, limitChunks);
  }

  /**
   * Get list of versions for a given page.
   * @param {string} pageId
   * @param {string} query
   * @param {number} limitChunks
   * @returns {Promise<Version[]>}
   */
  getVersions (pageId, query, limitChunks = 1) {
    const url = this._createUrl(`pages/${pageId}/versions`, query);
    return this._getListChunks(url, parseVersion, limitChunks);
  }

  /**
   * Get a single version of a page
   * @param {string} versionId
   * @returns {Promise<Version>}
   */
  getVersion (versionId) {
    const url = this._createUrl(`versions/${versionId}`, { different: false });
    return this._request(url)
      .then(response => response.json())
      .then(throwIfError(`Could not load version: ${versionId}`))
      .then(data => parseVersion(data.data));
  }

  /**
     * Get details on a change between two versions
     * @param {string} pageId
     * @param {string} fromVersion
     * @param {string} toVersion
     * @returns {Promise<Change>}
     */
  getChange (pageId, fromVersion, toVersion) {
    fromVersion = fromVersion || '';
    toVersion = toVersion || '';
    return this._request(this._createUrl(`pages/${pageId}/changes/${fromVersion}..${toVersion}`))
      .then(response => response.json())
      .then(throwIfError(`Could not load change from: pages/${pageId}/changes/${fromVersion}..${toVersion}`))
      .then(data => parseChange(data.data));
  }

  /**
     * Get a diff between any two versions of a page.
     * @param {string} pageId
     * @param {string} aId
     * @param {string} bId
     * @param {string} diffType
     * @returns {Promise<DiffData>}
     */
  getDiff (pageId, aId, bId, diffType, options) {
    const query = Object.assign({ format: 'json' }, options);
    return this._request(this._createUrl(`pages/${pageId}/changes/${aId}..${bId}/diff/${diffType}`, query))
      .then(response => response.json())
      .then(throwIfError('Could not load diff'))
      .then(data => data.data);
  }

  /**
     * Annotate a change with an object full of freeform data.
     * @param {string} pageId
     * @param {string} fromVersion
     * @param {string} toVersion
     * @param {Object} annotation
     * @returns {Promise<Annotation>}
     */
  annotateChange (pageId, fromVersion, toVersion, annotation) {
    return this._request(this._createUrl(`pages/${pageId}/changes/${fromVersion}..${toVersion}/annotations`), {
      body: JSON.stringify(annotation),
      method: 'POST',
      mode: 'cors',
    })
      .then(response => response.json())
      .then(data => parseAnnotation(data.data));
  }

  _createUrl (path, query) {
    const base = path.startsWith('/') ? '' : '/api/v0/';
    let url = `${this.url}${base}${path}`;
    if (query) {
      const queryList = [];
      for (const key in query) {
        let value = query[key];
        if (value == null) {
          queryList.push(encodeURIComponent(key));
        }
        else if (Array.isArray(value)) {
          const encodedKey = encodeURIComponent(key);
          for (let item of value) {
            queryList.push(`${encodedKey}[]=${encodeURIComponent(item)}`);
          }
        }
        else {
          if (key === CAPTURE_TIME) {
            value = formatDateRange(value);
          }
          queryList.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
        }
      }
      if (queryList.length) {
        url = `${url}?${queryList.join('&')}`;
      }
    }
    return url;
  }

  _request (url, options = {}) {
    const final_options = {
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    };

    if (this.authToken) {
      final_options.credentials = 'include';
      final_options.headers.Authorization = this._authHeader();
    }

    options.headers = new Headers(
      Object.assign(final_options.headers, options.headers));
    Object.assign(final_options, options);

    return fetch(url, final_options);
  }

  _loadToken () {
    if ('localStorage' in window) {
      this.authToken = localStorage.getItem(storageLocation);
      return this.authToken;
    }
    return null;
  }

  _saveToken (token) {
    if ('localStorage' in window) {
      localStorage.setItem(storageLocation, token);
    }
  }

  _verifyToken (refresh) {
    if (!this.authToken) {
      return Promise.reject(new Error('No token to verify'));
    }

    if (!this.tokenVerification) {
      const url = refresh ? '/users/sign_in' : '/users/session';
      this.tokenVerification = fetch(this._createUrl(url), {
        credentials: 'include',
        headers: new Headers({
          'Accept': 'application/json',
          'Authorization': this._authHeader(),
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }),
        method: refresh ? 'POST' : 'GET',
        mode: 'cors',
      })
        .then(response => response.json())
        .then(sessionData => {
          this.tokenVerification = null;
          this.isTokenVerfied = true;

          if (!sessionData.user) {
            this.authToken = null;
            throw new Error(sessionData.title || sessionData.message || 'Invalid token');
          }

          // replace our token with a fresh one if provided
          if (sessionData.token) {
            this.authToken = sessionData.token;
          }

          this.userData = sessionData.user;
          return sessionData;
        })
        .catch(error => {
          this.tokenVerification = null;
          return Promise.reject(error);
        });
    }

    return this.tokenVerification;
  }

  _basicAuthHeader (user, password) {
    return 'Basic ' + btoa(`${user}:${password}`);
  }

  _authHeader () {
    return `Bearer ${this.authToken}`;
  }

  _getListChunk (url, parser) {
    return this._request(url)
      .then(response => response.json())
      .then(throwIfError(`Could not load: ${url}`))
      .then(chunk => {
        chunk.data = chunk.data.map(parser);
        return chunk;
      });
  }

  _getListChunks (url, parser, limit = Infinity, result = []) {
    if (!url || !limit) return Promise.resolve(result);
    return this._getListChunk(url, parser)
      .then(chunk => {
        result.push(...chunk.data);
        return this._getListChunks(chunk.links.next, parser, limit - 1, result);
      });
  }
}

const CAPTURE_TIME = 'capture_time';

function parsePage (data) {
  const page = Object.assign({}, data, {
    created_at: new Date(data.created_at),
    updated_at: new Date(data.updated_at)
  });

  if (page.latest) {
    page.latest = parseVersion(page.latest);
  }

  if (page.versions) {
    page.versions = page.versions.map(parseVersion);
  }

  return page;
}

function parseVersion (data) {
  const result = Object.assign({}, data, {
    capture_time: new Date(data.capture_time),
    created_at: new Date(data.created_at),
    updated_at: new Date(data.updated_at)
  });

  // Update fields that will soon be migrated to new names/locations.
  // TODO: delete this section when API is fully migrated.
  if (!result.headers && result.source_metadata) {
    result.headers = result.source_metadata.headers;
  }
  if (result.version_hash) {
    result.body_hash = result.version_hash;
    delete result.version_hash;
  }
  if (result.uri) {
    result.body_url = result.uri;
    delete result.uri;
  }
  if (result.capture_url) {
    result.url = result.capture_url;
    delete result.capture_url;
  }

  return result;
}

function parseVersionSample (data) {
  return Object.assign({}, data, {
    time: new Date(data.time),
    version: parseVersion(data.version)
  });
}

function parseAnnotation (data) {
  return Object.assign({}, data, {
    created_at: new Date(data.created_at),
    updated_at: new Date(data.updated_at)
  });
}

function parseChange (data) {
  const updatedValues = { uuid: `${data.uuid_from}..${data.uuid_to}` };
  if (data.created_at) {
    updatedValues.created_at = new Date(data.created_at);
  }
  if (data.updated_at) {
    updatedValues.updated_at = new Date(data.updated_at);
  }
  return Object.assign({}, data, updatedValues);
}

/**
 * Create a function that will return the input data or throw an error if the
 * input data contains error information. Use this to reject the promise for an
 * HTTP request.
 *
 * @param {string} summary If there are multiple errors or an error message
 *   can not be found in the response, use this as the error message.
 * @returns {(data: object) => object}
 */
function throwIfError (summary) {
  return data => {
    // Proper API errors are formatted as an array of errors.
    if (data.errors) {
      const firstMessage = data.errors[0].title || data.errors[0].message;
      const message = data.errors.length > 1 && summary || firstMessage;
      const error = new Error(message);
      error.details = data.errors;
      throw error;
    }
    // Some parts of our system, however, return a single error.
    else if (data.error) {
      throw new Error(data.error.title || data.error.message || summary);
    }

    return data;
  };
}
