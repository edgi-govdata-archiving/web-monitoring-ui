import * as React from 'react';
import {Page} from '../services/web-monitoring-db';
import AnnotationForm from './annotation-form';
import DiffView from './diff-view';

export interface IPageDetailsProps {
    page: Page;
    returnToList: () => void;
}

export default class PageDetails extends React.Component<IPageDetailsProps, undefined> {
    render () {
        return (
            <div onClick={this.props.returnToList}>
                <h2>Page detail view for {this.props.page.uuid}</h2>
                <AnnotationForm version={this.props.page.latest} />
                <DiffView html="" />
            </div>
        );
    }
}
