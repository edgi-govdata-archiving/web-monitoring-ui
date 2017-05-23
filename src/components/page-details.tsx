import * as React from 'react';
import {Link, RouteComponentProps} from 'react-router-dom';
import {getPage, getVersion, Page, Version} from '../services/web-monitoring-db';
import AnnotationForm from './annotation-form';
import DiffView from './diff-view';

export type IPageDetailsProps = RouteComponentProps<{pageId: string}>;

interface IPageDetailsState {
    page: Page;
    version: Version;
    annotation: any;
}

export default class PageDetails extends React.Component<IPageDetailsProps, IPageDetailsState> {
    constructor (props: IPageDetailsProps) {
        super(props);
        this.state = {annotation: null, page: null, version: null};
        this.updateAnnotation = this.updateAnnotation.bind(this);
    }

    componentWillMount () {
        this.loadPage(this.props.match.params.pageId);
    }

    componentWillReceiveProps (nextProps: IPageDetailsProps) {
        const nextPageId = nextProps.match.params.pageId;
        if (nextPageId !== this.props.match.params.pageId) {
            this.loadPage(nextPageId);
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

        return (
            <div>
                <h2>Page detail view for {this.state.page.uuid}</h2>
                <Link to="/">Back to page list</Link>
                <AnnotationForm annotation={this.state.annotation} onChange={this.updateAnnotation} />
                <DiffView html="" />
            </div>
        );
    }

    private loadPage (pageId: string) {
        getPage(pageId)
            .then(page => {
                this.setState({page});
                return getVersion(page.uuid, page.versions[0].uuid);
            })
            .then(version => {
                if (this.state.page.uuid === version.page_uuid) {
                    this.setState({
                        annotation: version.current_annotation,
                        version
                    });
                }
            });
    }

    private updateAnnotation (newAnnotation: any) {
        // TODO: save annotation, etc.
        console.log(`Update annotation on Version ${this.state.version} to:`, newAnnotation);
        this.setState({annotation: newAnnotation});
    }
}
