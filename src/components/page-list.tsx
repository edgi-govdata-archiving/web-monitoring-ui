import * as React from 'react';
import {Page} from '../services/web-monitoring-db';

export interface IPageListProps {
    pages: Page[];
    onSelectPage: (page: Page) => void;
}

export default class PageList extends React.Component<IPageListProps, undefined> {
    render () {
        return (
            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-12">
                        <table className="table">
                            <thead>
                                {this.renderHeader()}
                            </thead>
                            <tbody>
                                {this.props.pages.map(page => this.renderRow(page))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    renderHeader () {
        return (
            <tr>
                <th>ID</th>
                <th>Output Date</th>
                <th>Site</th>
                <th>Page Name</th>
                <th>URL</th>
                <th>Page View URL</th>
                <th>Last Two</th>
                <th>Latest to Base</th>
            </tr>
        );
    }

    renderRow (record: Page) {
        const version = record.latest;
        const versionistaData = version.source_metadata;

        const diffWithPrevious = this.renderDiffLink(versionistaData.diff_with_previous_url);
        const diffWithFirst = this.renderDiffLink(versionistaData.diff_with_first_url);

        const onClick = this.didClickRow.bind(this, event, record);

        // TODO: click handling
        return (
            <tr key={record.uuid} onClick={onClick}>
                <td>{record.uuid}</td>
                <td>{record.latest.capture_time.toISOString()}</td>
                <td>{record.site}</td>
                <td>{record.title}</td>
                <td><a href={`https://${record.url}`} target="_blank">{record.url.substr(0, 20)}…</a></td>
                <td><a href={versionistaData.url} target="_blank">{versionistaData.url.substr(-15)}</a></td>
                <td>{diffWithPrevious}</td>
                <td>{diffWithFirst}</td>
            </tr>
        );
    }

    renderDiffLink (url: string) {
        if (url) {
            return <a href={url} target="_blank">{url.substr(-15)}</a>;
        }

        return <em>[Initial Version]</em>;
    }

    didClickRow (event: any, page: Page) {
        this.props.onSelectPage(page);
    }
}
