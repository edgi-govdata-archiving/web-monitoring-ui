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

        this.loadToken();
        // Explicit check because https://bugs.chromium.org/p/chromium/issues/detail?id=465666
        if (this.authToken) {
            this.verifyToken();
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

    isLoggedIn (verify: boolean = false): Promise<boolean> {
        if (this.authToken && (verify || !this.isTokenVerfied)) {
            return this.verifyToken()
                .then(data => true)
                .catch(() => false);
        }

        return Promise.resolve(false);
    }

    getPages (): Promise<Page[]> {
        return fetch(this.createUrl('pages', {source_type: 'versionista'}))
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

    private verifyToken () {
        if (!this.authToken) {
            return Promise.reject(new Error('No token to verify'));
        }

        if (!this.tokenVerification) {
            this.tokenVerification = fetch(this.createUrl(`/users/session`), {
                credentials: 'include',
                headers: new Headers({
                    Authorization: this.authHeader()
                }),
                mode: 'cors',
            })
                .then(response => response.json())
                .then(sessionData => {
                    this.tokenVerification = null;
                    this.isTokenVerfied = true;
                    if (!sessionData.id) {
                        this.authToken = null;
                        throw new Error(sessionData.title || sessionData.message || 'Invalid token');
                    }
                    this.userData = sessionData;
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
