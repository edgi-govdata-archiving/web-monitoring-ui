import * as React from 'react';
import {getVersion, Page, Version} from '../services/web-monitoring-db';
import AnnotationForm from './annotation-form';
import DiffView from './diff-view';

export interface IPageDetailsProps {
    page: Page;
    returnToList: () => void;
}

interface IPageDetailsState {
    version: Version;
    annotation: any;
}

export default class PageDetails extends React.Component<IPageDetailsProps, IPageDetailsState> {
    constructor (props: IPageDetailsProps) {
        super(props);
        this.state = {
            annotation: props.page.latest.current_annotation || {},
            version: props.page.latest
        };
        this.updateAnnotation = this.updateAnnotation.bind(this);
    }

    componentDidMount () {
        getVersion(this.props.page.uuid, this.state.version.uuid).then((version: Version) => {
            this.setState({
                annotation: version.current_annotation || {},
                version
            });
        });
    }

    render () {
        const returnToList = (event: React.MouseEvent<any>) => {
            event.preventDefault();
            this.props.returnToList();
        };

        return (
            <div>
                <h2>Page detail view for {this.props.page.uuid}</h2>
                <a href="#" onClick={returnToList}>Back to page list</a>
                <AnnotationForm annotation={this.state.annotation} onChange={this.updateAnnotation} />
                <DiffView html="" />
            </div>
        );
    }

    private updateAnnotation (newAnnotation: any) {
        this.setState({annotation: newAnnotation});
        console.log(`Update annotation on Version ${this.state.version} to:`, newAnnotation);
    }
}
