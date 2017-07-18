/* tslint:disable interface-name */
import WebMonitoringDb, {Page} from './web-monitoring-db';

export interface AnalysisTimeframe {
    start: Date;
    end: Date;
    duration: number;
}

export default class WebMonitoringApi {
    private dbApi: WebMonitoringDb;

    constructor (dbApi: WebMonitoringDb) {
        this.dbApi = dbApi;
    }

    getCurrentTimeframe (): Promise<AnalysisTimeframe> {
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

    getDomainsForUser (username: string): Promise<string[]> {
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

    getPagesForUser (username: string, timeframe?: AnalysisTimeframe): Promise<Page[]> {
        const domainsRequest = this.getDomainsForUser(username);
        const timeframeRequest = Promise.resolve(timeframe || this.getCurrentTimeframe());

        return Promise.all([domainsRequest, timeframeRequest])
            .then(([domains, timeframe]) => this.getPagesByDomains(
                domains,
                this.dateRangeString(timeframe)
            ));
    }

    private getPagesByDomains (domains: string[], dateRange?: string): Promise<Page[]> {
        const fetches = domains.map(domain => {
            const query: any = {site: domain};
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

    private dateRangeString (timeframe: {start?: Date, end?: Date}): string {
        if (!timeframe) {
            return null;
        }

        let range = timeframe.start ? timeframe.start.toISOString() : '';
        range += '..';
        range +=  timeframe.end ?  timeframe.end.toISOString() : '';
        return range;
    }
}
