/* tslint:disable interface-name */
const defaultApiUrl = 'https://web-monitoring-db-staging.herokuapp.com/';

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
    user?: string;
    password?: string;
}

export default class WebMonitoringDb {
    private url: string;
    private user: string;
    private password: string;

    constructor (options: IWebMonitoringDbOptions = {}) {
        this.url = options.url || defaultApiUrl;
        if (!this.url.endsWith('/')) {
            this.url += '/';
        }

        this.user = options.user;
        this.password = options.password;
    }

    getPages (): Promise<Page[]> {
        return fetch(this.createUrl('pages'))
            .then(response => response.json())
            .then(data => data.data.map(parsePage));
    }

    getPage (pageId: string): Promise<Page> {
        return fetch(this.createUrl(`pages/${pageId}`))
            .then(response => response.json())
            .then(data => parsePage(data.data));
    }

    // Tasking 2 - correct query -
    // https://web-monitoring-db-staging.herokuapp.com/api/v0/pages?site=EPA%20-%20epa.gov&capture_time=2017-05-31..

    // Time is always 3 days ago
    // getPageBySite (site: string): Promise<Page> {
    //     return fetch(this.createUrl(`pages/${pageId}`))
    //         .then(response => response.json())
    //         .then(data => parsePage(data.data));
    // }

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
                Authorization: this.basicAuthHeader()
            }),
            method: 'POST',
            mode: 'cors',
        })
            .then(response => response.json())
            .then(data => parseAnnotation(data.data));
    }

    private createUrl (path: string, query?: any) {
        let url = `${this.url}api/v0/${path}`;
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

    private basicAuthHeader () {
        return 'Basic ' + btoa(`${this.user}:${this.password}`);
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
