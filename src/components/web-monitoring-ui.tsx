import * as PropTypes from 'prop-types';
import * as React from 'react';
import {BrowserRouter as Router, Link, Route} from 'react-router-dom';
import bindComponent from '../scripts/bind-component';
import WebMonitoringDb, {Page} from '../services/web-monitoring-db';
import NavBar from './nav-bar';
import PageDetails from './page-details';
import PageList from './page-list';

const configuration = (window as any).webMonitoringConfig;
const loggedIn = (window as any).loggedIn;

const api = new WebMonitoringDb({
    password: configuration.WEB_MONITORING_DB_PASSWORD,
    url: configuration.WEB_MONITORING_DB_URL,
    user: configuration.WEB_MONITORING_DB_USER
});

// Maintain a top-level list of pages to share across the app. We do this
// here instead of via caching in the web-monitoring-db API because we want any
// part of the app that iterates through pages to iterate through the same set
// of pages with the same filters and conditions.
export interface IWebMonitoringUiState {
    pages?: Page[];
}

// The WebMonitoringUi represents the root container for the app.
export default class WebMonitoringUi extends React.Component<undefined, IWebMonitoringUiState> {
    static childContextTypes = {
        api: PropTypes.instanceOf(WebMonitoringDb)
    };

    constructor () {
        super();
        this.state = {pages: null};
    }

    componentWillMount () {
        /* Tasking 1 - if (loggedIn) getDomains, filter over array and return Page[] else */
        const debug = true;
        if (debug) {
            const domains = [
                'EPA - epa.gov/arc-x',
                'CDC - ephtracking.cdc.gov - Climate Change',
                'EPA - epa.gov/climatechange',
                ];
            api.getPagesByDomains(domains).then((pages: Page[]) => {
                this.setState({pages});
            });
        } else {
            api.getPages().then((pages: Page[]) => {
                this.setState({pages});
            });
        }
    }

    componentDidMount () {
        // TODO: NOT WORKING! GET IT WORKING!
        const pagesByDomain = getPagesByDomain();
        pagesByDomain
        .then(pages => this.setState(pages))
        .catch(err => console.log(err));
    }

    render () {
        const withPages = bindComponent({pages: this.state.pages});

        return (
            <Router>
                <div>
                    <NavBar title="EDGI" />
                    <Route exact path="/" render={withPages(PageList)} />
                    <Route path="/page/:pageId" render={withPages(PageDetails)} />
                </div>
            </Router>
        );
    }

    getChildContext () {
        return {api};
    }
}

function getPagesByDomain (): Promise<any> {
    const userName = 'eric@gmail.com';
    const url = `${window.location.origin}/domains/${userName}`;
    const gotStuff = fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.domains) {
                console.log(data.domains);
                return api.getPagesByDomains(data.domains).then((pages: Page[]) => {
                    return pages;
                });
            } else {
                return Promise.reject('Nothing found');
            }
        })
        .catch(err => Promise.reject(err));
    return gotStuff;
}
