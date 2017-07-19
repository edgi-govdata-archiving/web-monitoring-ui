import * as PropTypes from 'prop-types';
import * as React from 'react';
import {Link, RouteComponentProps} from 'react-router-dom';
import WebMonitoringDb, {Page} from '../services/web-monitoring-db';
import ChangeView from './change-view';

// export type IPageDetailsProps = RouteComponentProps<{pageId: string}>;
export interface IPageDetailsProps extends RouteComponentProps<{pageId: string}> {
    pages: Page[];
    user?: any;
}

interface IPageDetailsState {
    page: Page;
}

export default class PageDetails extends React.Component<IPageDetailsProps, IPageDetailsState> {
    static contextTypes = {
        api: PropTypes.instanceOf(WebMonitoringDb)
    };

    context: {api: WebMonitoringDb};

    constructor (props: IPageDetailsProps) {
        super(props);
        this.state = {page: null};
        this.annotateChange = this.annotateChange.bind(this);
    }

    componentWillMount () {
        this.loadPage(this.props.match.params.pageId);
    }

    componentDidMount () {
        window.addEventListener('keydown', this);
    }

    componentWillUnmount () {
        window.removeEventListener('keydown', this);
    }

    componentWillReceiveProps (nextProps: IPageDetailsProps) {
        const nextPageId = nextProps.match.params.pageId;
        if (nextPageId !== this.props.match.params.pageId) {
            this.loadPage(nextPageId);
        }
    }

    handleEvent (event: KeyboardEvent) {
        if (event.keyCode === 27) {
            this.props.history.push(`/`);
        }
    }

    annotateChange (fromVersion: string, toVersion: string, annotation: any) {
        this.context.api.annotateChange(this.state.page.uuid, fromVersion, toVersion, annotation);
    }

    render () {
        const returnToList = (event: React.MouseEvent<any>) => {
            event.preventDefault();

        };

        // TODO: should factor out a loading view
        if (!(this.state.page)) {
            return <div>Loading…</div>;
        }

        const page = this.state.page;

        // TODO: this HTML should probably be broken up a bit
        return (
            <div className="container-fluid container-page-view">
                <div className="row">
                    <div className="col-md-9">
                        <h2 className="diff-title">{page.title}</h2>
                        <a className="diff_page_url" href={page.url} target="_blank" rel="noopener">{page.url}</a>
                    </div>
                    <div className="col-md-3">
                        {this.renderPager()}
                    </div>
                </div>
                <ChangeView
                    page={this.state.page}
                    annotateChange={this.annotateChange}
                    user={this.props.user}
                />
            </div>
        );
    }

    private renderPager () {
        const allPages = this.props.pages || [];
        const index = allPages.findIndex(page => page.uuid === this.state.page.uuid);
        const previousPage = allPages[index - 1];
        const previousUrl = previousPage ? `/page/${previousPage.uuid}` : '#';
        const nextPage = index >= 0 ? allPages[index + 1] : null;
        const nextUrl = nextPage ? `/page/${nextPage.uuid}` : '#';

        return (
            <nav aria-label="...">
                <ul className="pager">
                    <li>
                        <Link to={previousUrl} className="pager__previous">
                            <i className="fa fa-arrow-left" aria-hidden="true" /> Previous
                        </Link>
                    </li>
                    <li>
                        <Link to={nextUrl} className="pager__next">
                            Next <i className="fa fa-arrow-right" aria-hidden="true" />
                        </Link>
                    </li>
                </ul>
            </nav>
        );
    }

    private loadPage (pageId: string) {
        // TODO: handle the missing `.versions` collection problem better
        const fromList = this.props.pages && this.props.pages.find(
            (page: Page) => page.uuid === pageId && !!page.versions);

        Promise.resolve(fromList || this.context.api.getPage(pageId))
            .then((page: Page) => {
                this.setState({page});
            });
    }

}
