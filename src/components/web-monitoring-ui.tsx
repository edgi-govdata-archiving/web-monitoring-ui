import * as PropTypes from 'prop-types';
import * as React from 'react';
import {BrowserRouter as Router, Link, Route} from 'react-router-dom';
import bindComponent from '../scripts/bind-component';
import WebMonitoringDb, {Page} from '../services/web-monitoring-db';
import NavBar from './nav-bar';
import PageDetails from './page-details';
import PageList from './page-list';

const configuration = (window as any).webMonitoringConfig;
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
        api.getPages().then((pages: Page[]) => {
            this.setState({pages});
        });
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
