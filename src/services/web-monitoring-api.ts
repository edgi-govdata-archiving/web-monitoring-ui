import WebMonitoringDb, {Page} from './web-monitoring-db';

export default class WebMonitoringApi {
    private dbApi: WebMonitoringDb;

    constructor (dbApi: WebMonitoringDb) {
        this.dbApi = dbApi;
    }

    getDomainsForUser (username: string): Promise<any> {
        const url = `/api/domains/${username}`;
        return fetch(url).then(response => response.json());
    }

    getPagesByUser (username: string): Promise<Page[]> {
        return this.getDomainsForUser(username)
            .then(data => {
                if (data.domains) {
                    return this.dbApi.getPagesByDomains(data.domains);
                } else {
                    return Promise.reject(data.error);
                }
        });
    }
}
