import * as React from 'react';
import NavBar from './nav-bar'
import PageList from './page-list'
import PageDetails from './page-details';
import {getPages, Page} from '../services/web-monitoring-db';

export interface WebMonitoringUiProps {
}

export interface WebMonitoringUiState {
    ready: boolean;
    pages?: Array<Page>;
    viewingPage?: Page;
}

// The WebMonitoringUi represents the root container for the app
export default class WebMonitoringUi extends React.Component<WebMonitoringUiProps, WebMonitoringUiState> {
    constructor(props: WebMonitoringUiProps) {
        super(props);
        this.state = {ready: false};
    }

    componentDidMount () {
        getPages().then((pages: Array<Page>) => {
            this.setState({
                ready: true,
                pages: pages
            });
        });
    }

    render () {
        const onSelectPage = this.onSelectPage.bind(this);
        let mainView;
        if (!this.state.ready) {
            mainView = <div>Loading…</div>
        }
        else if (this.state.viewingPage) {
            mainView = <PageDetails page={this.state.viewingPage} returnToList={() => this.setState({viewingPage: null})} />
        }
        else {
            mainView = <PageList pages={this.state.pages} onSelectPage={onSelectPage} />
        }

        return <div>
            <NavBar title="EDGI" />
            <div className="main-view">
                {mainView}
            </div>
        </div>;
    }

    onSelectPage (page: any) {
        console.log('Selected:', page);
        this.setState({viewingPage: page});
    }
}
