/* tslint:disable interface-name */
import mockData from '../../data/mock-api-pages';

const defaultApiUrl = 'https://web-monitoring-db-staging.herokuapp.com/';

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
}

export interface Page {
    uuid: string;
    url: string;
    title: string;
    agency: string;
    site: string;
    created_at: Date;
    updated_at: Date;
    latest: Version;
}

interface IApiResponse {
    links?: {};
    data?: {}|any[];
    errors?: any[];
}

export function getPages () {
    return fetch(`${defaultApiUrl}api/v0/pages`)
        .then(response => response.json())
        .then(data => data.data.map(parsePage));
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
