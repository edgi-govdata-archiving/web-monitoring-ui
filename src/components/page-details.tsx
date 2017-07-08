import * as PropTypes from 'prop-types';
import * as React from 'react';
import {Link, RouteComponentProps} from 'react-router-dom';
import WebMonitoringDb, {Annotation, Page, Version} from '../services/web-monitoring-db';
import AnnotationForm from './annotation-form';
import ChangeView from './change-view';

// export type IPageDetailsProps = RouteComponentProps<{pageId: string}>;
export interface IPageDetailsProps extends RouteComponentProps<{pageId: string}> {
    pages: Page[];
    user?: any;
}

interface IPageDetailsState {
    page: Page;
    version: Version;
    annotation: any;
    collapsedView: boolean;
}

export default class PageDetails extends React.Component<IPageDetailsProps, IPageDetailsState> {
    static contextTypes = {
        api: PropTypes.instanceOf(WebMonitoringDb)
    };

    context: {api: WebMonitoringDb};

    constructor (props: IPageDetailsProps) {
        super(props);
        this.state = {annotation: null, page: null, version: null, collapsedView: true};
        this.saveAnnotation = this.saveAnnotation.bind(this);
        this.updateAnnotation = this.updateAnnotation.bind(this);
        this.toggleCollapsedView = this.toggleCollapsedView.bind(this);
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

    render () {
        const returnToList = (event: React.MouseEvent<any>) => {
            event.preventDefault();

        };

        // TODO: should factor out a loading view
        if (!(this.state.page && this.state.version)) {
            return <div>Loading…</div>;
        }

        const page = this.state.page;
        const version = this.state.version;
        const markAsSignificant = () => console.error('markAsSignificant not implemented');
        const addToDictionary = () => console.error('markAsSignificant not implemented');

        const diffLinks = [];
        const versionista = version.source_metadata;
        if (versionista.diff_with_previous_url) {
            diffLinks.push(
                <a href={versionista.diff_with_previous_url} target="_blank" rel="noopener">
                    Last two diff
                </a>
            );
        }
        if (versionista.diff_with_first_url) {
            diffLinks.push(
                <a href={versionista.diff_with_first_url} target="_blank" rel="noopener">
                    Last to base diff
                </a>
            );
        }

        // TODO: this HTML should probably be broken up a bit
        return (
            <div className="container-fluid container-page-view">
                <div className="row">
                    <div className="col-md-9">
                        <h2 className="diff-title">{version.uuid} - {page.title}</h2>
                        <a className="diff_page_url" href={page.url} target="_blank" rel="noopener">{page.url}</a>
                    </div>
                    <div className="col-md-3">
                        {this.renderPager()}
                    </div>
                </div>

                <hr />

                {this.renderAnalysisTools(markAsSignificant, addToDictionary)}

                <hr />
                <div className="row">
                    <div className="col-md-12">
                        {diffLinks[0]} || {diffLinks[1]}
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12">
                        <ChangeView page={this.state.page} />
                    </div>
                </div>
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

    private renderAnalysisTools (markAsSignificant: any, addToDictionary: any) {
        if (!this.props.user) {
            return <p>Log in to annotate changes.</p>;
        }

        return (
            <div>
                <div className="row">
                    <div className="col-md-6">
                        <i className="fa fa-toggle-on" aria-hidden="true" />
                        {/* TODO: should be buttons */}
                        <a className="lnk-action" href="#" onClick={this.toggleCollapsedView}>Toggle Signifiers</a>
                        <i className="fa fa-pencil" aria-hidden="true" />
                        <a className="lnk-action" href="#" onClick={this.saveAnnotation}>Update Record</a>
                        <i className="fa fa-list" aria-hidden="true" />
                        <Link to="/" className="lnk-action">Back to list view</Link>
                    </div>
                    <div className="col-md-6 text-right">
                        <i className="fa fa-upload" aria-hidden="true" />
                        <a className="lnk-action" href="#" onClick={markAsSignificant}>Add Important Change</a>
                        <i className="fa fa-database" aria-hidden="true" />
                        <a href="#" onClick={addToDictionary}>Add to Dictionary</a>
                    </div>
                </div>

                <AnnotationForm
                    annotation={this.state.annotation}
                    onChange={this.updateAnnotation}
                    collapsed={this.state.collapsedView}
                />
            </div>
        );
    }

    private loadPage (pageId: string) {
        const fromList = this.props.pages && this.props.pages.find(
            (page: Page) => page.uuid === pageId);

        Promise.resolve(fromList || this.context.api.getPage(pageId))
            .then((page: Page) => {
                this.setState({page});
                this.loadLatestVersion(page);
            });
    }

    private loadLatestVersion (page: Page) {
        const latest = page.latest || page.versions[0];
        if (!latest) {
            this.loadPage(page.uuid);
        }
        else {
            this.context.api.getVersion(page.uuid, latest.uuid)
                .then(version => {
                    if (this.state.page.uuid === version.page_uuid) {
                        this.setState({
                            annotation: version.current_annotation,
                            version
                        });
                    }
                });
        }
    }

    private loadVersion (page: Page, version: Version) {
        // const latest = page.latest || page.versions[0];
        // if (!latest) {
            // this.loadPage(page.uuid);
        // }
        // else {
            // this.context.api.getVersion(page.uuid, latest.uuid)
            //     .then(version => {
            //         if (this.state.page.uuid === version.page_uuid) {
            //             this.setState({
            //                 annotation: version.current_annotation,
            //                 version
            //             });
            //         }
            //     });
        // }
    }

    private updateAnnotation (newAnnotation: any) {
        this.setState({annotation: newAnnotation});
    }

    private saveAnnotation (event: React.SyntheticEvent<HTMLElement>) {
        event.preventDefault();
        // TODO: display some indicator that saving is happening/complete
        const version = this.state.version;
        this.context.api.annotateVersion(version.page_uuid, version.uuid, this.state.annotation)
            .then((annotationRecord: Annotation) => {
                this.loadLatestVersion(this.state.page);
            });
    }

    private toggleCollapsedView () {
        this.setState(previousState => ({collapsedView: !previousState.collapsedView}));
    }
}
