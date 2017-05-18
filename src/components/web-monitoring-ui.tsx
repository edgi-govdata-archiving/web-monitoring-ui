import * as React from 'react';
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

    componentDidMount () {
        getPages().then((pages: Page[]) => {
            this.setState({
                ready: true,
                pages
            });
        });
    }

    render () {
        let mainView;
        if (!this.state.ready) {
            mainView = <div>Loading…</div>;
        }
        else if (this.state.viewingPage) {
            const returnToList = this.switchToListView.bind(this);
            mainView = <PageDetails page={this.state.viewingPage} returnToList={returnToList} />;
        }
        else {
            const onSelectPage = this.onSelectPage.bind(this);
            mainView = <PageList pages={this.state.pages} onSelectPage={onSelectPage} />;
        }

        return (
            <div>
                <NavBar title="EDGI" />
                <div className="main-view">
                    {mainView}
                </div>
            </div>
        );
    }

    onSelectPage (page: any) {
        this.setState({viewingPage: page});
    }

    switchToListView () {
        this.setState({viewingPage: null});
    }
}
