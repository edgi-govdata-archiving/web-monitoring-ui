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
        const returnToList = (event: React.MouseEvent<any>) => {
            event.preventDefault();
            this.props.returnToList();
        };

        return (
            <div>
                <h2>Page detail view for {this.props.page.uuid}</h2>
                <a href="#" onClick={returnToList}>Back to page list</a>
                <AnnotationForm version={this.props.page.latest} />
                <DiffView html="" />
            </div>
        );
    }
}
