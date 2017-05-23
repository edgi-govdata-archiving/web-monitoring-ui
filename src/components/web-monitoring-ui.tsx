import * as React from 'react';
import {BrowserRouter as Router, Link, Route} from 'react-router-dom';
import {getPages, Page} from '../services/web-monitoring-db';
import NavBar from './nav-bar';
import PageDetails from './page-details';
import PageList from './page-list';

export interface IWebMonitoringUiState {
    ready: boolean;
    pages?: Page[];
    viewingPage?: Page;
}

// The WebMonitoringUi represents the root container for the app
export default class WebMonitoringUi extends React.Component<undefined, IWebMonitoringUiState> {
    constructor () {
        super();
        this.state = {ready: false};
    }

    render () {
        return (
            <Router>
                <div>
                    <NavBar title="EDGI" />
                    <Route exact path="/" component={PageList} />
                    <Route path="/page/:pageId" component={PageDetails} />
                </div>
            </Router>
        );
    }
}
