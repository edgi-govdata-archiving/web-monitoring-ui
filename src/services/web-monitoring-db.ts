/* tslint:disable interface-name */
import mockData from '../../data/mock-api-pages';

// const defaultApiUrl = 'https://web-monitoring-db-staging.herokuapp.com/';
const defaultApiUrl = 'http://web-monitoring-db.dev/';

export interface Version {
    uuid: string;
    page_uuid?: string;
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

interface IApiResponse {
    links?: {};
    data?: {}|any[];
    errors?: any[];
}

export function getPages (): Promise<Page[]> {
    return fetch(`${defaultApiUrl}api/v0/pages`)
        .then(response => response.json())
        .then(data => data.data.map(parsePage));
}

export function getPage (pageId: string): Promise<Page> {
    return fetch(`${defaultApiUrl}api/v0/pages/${pageId}`)
        .then(response => response.json())
        .then(data => parsePage(data.data));
}

export function getVersions (pageId: string): Promise<Version[]> {
    return fetch(`${defaultApiUrl}api/v0/pages/${pageId}/versions`)
        .then(response => response.json())
        .then(data => data.data.map(parseVersion));
}

export function getVersion (pageId: string, versionId: string): Promise<Version> {
    return fetch(`${defaultApiUrl}api/v0/pages/${pageId}/versions/${versionId}`)
        .then(response => response.json())
        .then(data => parseVersion(data.data));
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
