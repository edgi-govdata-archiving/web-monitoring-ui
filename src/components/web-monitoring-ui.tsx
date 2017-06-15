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
        if (typeof loggedIn === 'string' && loggedIn) {
            const pagesByDomain = getPagesByUser(loggedIn);
            pagesByDomain
                .then(pages => this.setState({pages}))
                .catch(err => {
                    api.getPages().then((pages: Page[]) => {
                        this.setState({pages});
                    });
                });
        } else {
            api.getPages().then((pages: Page[]) => {
                this.setState({pages});
            });
        }
    }

    render () {
        const withPages = bindComponent({pages: this.state.pages});

        return (
            <Router>
                <div>
                    <NavBar title="EDGI" />
                    <Route exact path="/" render={withPages(PageList)} />
                    <Route path="/page/:pageId" render={withPages(PageDetails)} />
                    <Route path="/loggedIn/:username" render={withPages(PageList)} />
                </div>
            </Router>
        );
    }

    getChildContext () {
        return {api};
    }
}

function getPagesByUser (userName: string): Promise<any> {
    const url = `${window.location.origin}/domains/${userName}`;
    return fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.domains) {
                return api.getPagesByDomains(data.domains).then(pages => pages);
            } else {
                return Promise.reject(data.error);
            }
        })
        .then(pages => pages)
        .catch(err => Promise.reject(err));
}
