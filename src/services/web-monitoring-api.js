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

  _postChange (page, fromVersion, toVersion, annotation, url, description = 'save a change') {
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
}
