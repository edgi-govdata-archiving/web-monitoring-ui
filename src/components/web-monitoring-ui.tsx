import * as React from 'react';
import {BrowserRouter as Router, Link, Route} from 'react-router-dom';
import bindComponent from '../scripts/bind-component';
import {getPages, Page} from '../services/web-monitoring-db';
import NavBar from './nav-bar';
import PageDetails from './page-details';
import PageList from './page-list';

// Maintain a top-level list of pages to share across the app. We do this
// here instead of via caching in the web-monitoring-db API because we want any
// part of the app that iterates through pages to iterate through the same set
// of pages with the same filters and conditions.
export interface IWebMonitoringUiState {
    pages?: Page[];
}

// The WebMonitoringUi represents the root container for the app.
export default class WebMonitoringUi extends React.Component<undefined, IWebMonitoringUiState> {
    constructor () {
        super();
        this.state = {pages: null};
    }

    componentWillMount () {
        getPages().then((pages: Page[]) => {
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
}
