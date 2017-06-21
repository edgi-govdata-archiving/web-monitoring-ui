import WebMonitoringDb, {Page} from './web-monitoring-db';

export default class WebMonitoringApi {
    private configuration = (window as any).webMonitoringConfig;
    private dbApi = new WebMonitoringDb({
        password: this.configuration.WEB_MONITORING_DB_PASSWORD,
        url: this.configuration.WEB_MONITORING_DB_URL,
        user: this.configuration.WEB_MONITORING_DB_USER
    });

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
