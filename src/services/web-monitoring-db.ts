import mockData from './mock-data';

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

export function getPages () {
    return Promise.resolve(mockData.map((page:any) => {
        const version = Object.assign({}, page.latest, {
            capture_time: new Date(page.latest.capture_time),
            created_at: new Date(page.latest.created_at),
            updated_at: new Date(page.latest.updated_at)
        });

        return Object.assign({}, page, {
            created_at: new Date(page.created_at),
            updated_at: new Date(page.updated_at),
            latest: version
        });
    }));
}
