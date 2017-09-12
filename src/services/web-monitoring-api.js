/**
 * @typedef {Object} AnalysisTimeframe
 * @property {Date} start
 * @property {Date} end
 * @property {number} duration length of the timeframe in milliseconds
 */

/**
 * Access the UI-specific tasking and management API
 * @class WebMonitoringApi
 * @param {WebMonitoringDb} dbApi Remote DB API instance to wrap
 */
export default class WebMonitoringApi {
  constructor (dbApi) {
    /** @property {WebMonitoringDb} dbApi */
    this.dbApi = dbApi;
  }

  /**
     * Get the current analysis timeframe a user should be working on.
     * @returns {Promise<AnalysisTimeframe>}
     */
  getCurrentTimeframe () {
    return fetch(`/api/timeframe?date=${new Date().toISOString()}`)
      .then(response => response.json())
      .then(timeframe => {
        if (timeframe.error) {
          throw new Error(timeframe.error);
        }

        return {
          duration: timeframe.duration,
          end: new Date(timeframe.end),
          start: new Date(timeframe.start)
        };
      });
  }

  /**
     * Get a list of domains assigned to a given user.
     * @param {string} username
     * @returns {Promise<string[]>}
     */
  getDomainsForUser (username) {
    if (!username) {
      return Promise.reject(new TypeError('The first argument to getDomainsForUser() must be a string.'));
    }

    const url = `/api/domains/${username}`;
    return fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          throw data.error;
        }

        return data.domains;
      });
  }

  /**
     * Get a list of pages a user should analyze based on their assigned
     * domains and the analysis timeframe.
     *
     * @param {string} username
     * @param {AnalysisTimeframe} [timeframe] If omitted, defaults to current
     * @param {object} [query] Additional query options for getting pages
     * @returns {Promise<Page[]>}
     */
  getPagesForUser (username, timeframe, query = {}) {
    const domainsRequest = this.getDomainsForUser(username);
    const timeframeRequest = Promise.resolve(timeframe || this.getCurrentTimeframe());

    return Promise.all([domainsRequest, timeframeRequest])
      .then(([domains, timeframe]) => this._getPagesByDomains(
        domains,
        this._dateRangeString(timeframe),
        query
      ));
  }

  /**
     * Add change information to the dictionary of insignificant changes in
     * Google sheets.
     *
     * @param {Page}    page
     * @param {Version} fromVersion
     * @param {Version} toVersion
     * @param {Object}  annotation
     * @returns {Promise<boolean>}
     */
  addChangeToDictionary (page, fromVersion, toVersion, annotation) {
    return this._postChange(
      page,
      fromVersion,
      toVersion,
      annotation,
      '/api/dictionary',
      'add to the change dictionary'
    );
  }

  /**
     * Add change information to the list of important/significant changes in
     * Google sheets.
     *
     * @param {Page}    page
     * @param {Version} fromVersion
     * @param {Version} toVersion
     * @param {Object}  annotation
     * @returns {Promise<boolean>}
     */
  addChangeToImportant (page, fromVersion, toVersion, annotation) {
    return this._postChange(
      page,
      fromVersion,
      toVersion,
      annotation,
      '/api/importantChange',
      'add to the list of important changes'
    );
  }

  _postChange (page, fromVersion, toVersion, annotation, url, description='save a change') {
    if (!this.dbApi.userData) {
      return Promise.reject(
        new Error(`You must be logged in to ${description}.`));
    }

    const minimalPage = Object.assign({}, page);
    delete minimalPage.versions;
    delete minimalPage.latest;

    return fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        page: minimalPage,
        from_version: fromVersion,
        to_version: toVersion,
        annotation,
        user: this.dbApi.userData.email
      }),
      credentials: 'include',
      headers: new Headers({
        'Authorization': this.dbApi._authHeader(),
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      })
    });
  }

  _getPagesByDomains (domains, dateRange, extraQuery) {
    const fetches = domains.map(domain => {
      const query = Object.assign({site: domain}, extraQuery);
      if (dateRange) {
        query.capture_time = dateRange;
      }

      return this.dbApi.getPages(query);
    });

    /* TODO: Make sure pages are unique, because some are shared across domains.
                 Will implement when we get some test data. */
    return Promise.all(fetches)
      .then(data => data.reduce((acc, arr) => acc.concat(arr), []));
  }

  _dateRangeString (timeframe) {
    if (!timeframe) {
      return null;
    }

    let range = timeframe.start ? timeframe.start.toISOString() : '';
    range += '..';
    range +=  timeframe.end ?  timeframe.end.toISOString() : '';
    return range;
  }
}
