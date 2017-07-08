/* tslint:disable interface-name */
const defaultApiUrl = 'https://web-monitoring-db-staging.herokuapp.com/';
const storageLocation = 'WebMonitoringDb.token';

export interface Version {
    uuid: string;
    page_uuid: string;
    capture_time: Date;
    uri: string;
    version_hash: string;
    source_type: string;
    source_metadata: any;
    created_at: Date;
    updated_at: Date;
    current_annotation?: any;
}

export interface Page {
    uuid: string;
    url: string;
    title: string;
    agency: string;
    site: string;
    created_at: Date;
    updated_at: Date;
    latest?: Version;
    versions?: Version[];
}

export interface Annotation {
    annotation: any;
    author: any;
    created_at: Date;
    updated_at: Date;
}

interface IApiResponse {
    links?: {};
    data?: {}|any[];
    errors?: any[];
}

interface IWebMonitoringDbOptions {
    url?: string;
    useSavedCredentials?: boolean;
}

export default class WebMonitoringDb {
    userData: any;

    private url: string;
    private authToken: string;
    private isTokenVerfied: boolean;
    private tokenVerification: Promise<any>;

    constructor (options: IWebMonitoringDbOptions = {}) {
        this.url = options.url || defaultApiUrl;
        if (this.url.endsWith('/')) {
            this.url = this.url.slice(0, -1);
        }

        const useSavedCredentials = options.useSavedCredentials;
        if (useSavedCredentials === true || useSavedCredentials == null) {
            this.loadToken();
            // Explicit check because https://bugs.chromium.org/p/chromium/issues/detail?id=465666
            if (this.authToken) {
                this.verifyToken(true);
            }
        }
    }

    logIn (user: string, password: string) {
        return fetch(this.createUrl(`/users/sign_in`), {
            body: JSON.stringify({
                user: {
                    email: user,
                    password
                }
            }),
            headers: new Headers({
                'Accept': 'application/json',
                'Content-Type': 'application/json'
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
                this.saveToken(this.authToken);
                this.isTokenVerfied = true;
                this.userData = sessionData.user;
                return this.userData;
            });
    }

    logOut () {
        this.authToken = null;
        this.saveToken('');
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
    isLoggedIn (verify: boolean = false): Promise<boolean> {
        if (this.authToken && (verify || !this.isTokenVerfied)) {
            return this.verifyToken()
                .then(data => true)
                .catch(() => false);
        }

        return Promise.resolve(!!this.userData);
    }

    getPages (query?: any): Promise<Page[]> {
        return fetch(this.createUrl('pages', query))
            .then(response => response.json())
            .then(data => data.data.map(parsePage));
    }

    getPage (pageId: string): Promise<Page> {
        return fetch(this.createUrl(`pages/${pageId}`))
            .then(response => response.json())
            .then(data => parsePage(data.data));
    }

    getVersions (pageId: string): Promise<Version[]> {
        return fetch(this.createUrl(`pages/${pageId}/versions`))
            .then(response => response.json())
            .then(data => data.data.map(parseVersion));
    }

    getVersion (pageId: string, versionId: string): Promise<Version> {
        return fetch(this.createUrl(`pages/${pageId}/versions/${versionId}`))
            .then(response => response.json())
            .then(data => parseVersion(data.data));
    }

    getDiff (pageId: string, aId: string, bId: string, diffType: string): Promise<any> {
        // http://localhost:3000/api/v0/pages/PAGE_UID/changes/VERSION_A_UID..VERSION_B_UID/diff/html_text
        return fetch(this.createUrl(`/api/v0/pages/${pageId}/changes/${aId}..${bId}/diff/${diffType}`))
            .then(response => response.json())
            // .then(data => parseDiff(data))
            // TODO - need to properly parse out diff stuff here, will need to
            // pull proper diff data out of the response, possibly with a "parseDiff" func
            .then(data => data.data);
    }

    annotateVersion (pageId: string, versionId: string, annotation: any): Promise<Annotation> {
        return fetch(this.createUrl(`pages/${pageId}/versions/${versionId}/annotations`), {
            body: JSON.stringify(annotation),
            credentials: 'include',
            headers: new Headers({
                Authorization: this.authHeader()
            }),
            method: 'POST',
            mode: 'cors',
        })
            .then(response => response.json())
            .then(data => parseAnnotation(data.data));
    }

    private createUrl (path: string, query?: any) {
        const base = path.startsWith('/') ? '' : '/api/v0/';
        let url = `${this.url}${base}${path}`;
        if (query) {
            const queryList = [];
            for (const key in query) {
                const value = query[key];
                if (value == null) {
                    queryList.push(encodeURIComponent(key));
                }
                else {
                    queryList.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
                }
            }
            if (queryList.length) {
                url = `${url}?${queryList.join('&')}`;
            }
        }
        return url;
    }

    private loadToken () {
        if ('localStorage' in window) {
            this.authToken = localStorage.getItem(storageLocation);
            return this.authToken;
        }
        return null;
    }

    private saveToken (token: string) {
        if ('localStorage' in window) {
            localStorage.setItem(storageLocation, token);
        }
    }

    private verifyToken (refresh?: boolean) {
        if (!this.authToken) {
            return Promise.reject(new Error('No token to verify'));
        }

        if (!this.tokenVerification) {
            const url = refresh ? '/users/sign_in' : '/users/session';
            this.tokenVerification = fetch(this.createUrl(url), {
                credentials: 'include',
                headers: new Headers({
                    'Accept': 'application/json',
                    'Authorization': this.authHeader(),
                    'Content-Type': 'application/json'
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

    private basicAuthHeader (user: string, password: string) {
        return 'Basic ' + btoa(`${user}:${password}`);
    }

    private authHeader () {
        return `Bearer ${this.authToken}`;
    }
}

function parsePage (data: any): Page {
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

function parseVersion (data: any): Version {
    return Object.assign({}, data, {
        capture_time: new Date(data.capture_time),
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at)
    });
}

function parseAnnotation (data: any): Annotation {
    return Object.assign({}, data, {
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at)
    });
}
