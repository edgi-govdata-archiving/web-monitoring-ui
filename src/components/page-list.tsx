import * as React from 'react';
import {Link, RouteComponentProps} from 'react-router-dom';
import {getPages, Page} from '../services/web-monitoring-db';

export type IPageListProps = RouteComponentProps<{}>;

interface IPageListState {
    pages: Page[];
}

export default class PageList extends React.Component<IPageListProps, IPageListState> {
    constructor (props: IPageListProps) {
        super(props);
        this.state = {pages: null};
    }

    render () {
        if (!this.state.pages) {
            return <div>Loading…</div>;
        }

        return (
            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-12">
                        <table className="table">
                            <thead>
                                {this.renderHeader()}
                            </thead>
                            <tbody>
                                {this.state.pages.map(page => this.renderRow(page))}
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

        const onClick = this.didClickRow.bind(this, record);

        // TODO: click handling
        return (
            <tr key={record.uuid} onClick={onClick}>
                <td>{record.uuid}</td>
                <td>{record.latest.capture_time.toISOString()}</td>
                <td>{record.site}</td>
                <td>{record.title}</td>
                <td><a href={record.url} target="_blank">{record.url.substr(0, 20)}…</a></td>
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

    didClickRow (page: Page, event: React.MouseEvent<HTMLElement>) {
        if (isInAnchor(event.target)) {
            return;
        }

        // this.props.onSelectPage(page);
        this.props.history.push(`/page/${page.uuid}`);
    }

    componentWillMount () {
        this.loadPages();
    }

    private loadPages () {
        getPages().then((pages: Page[]) => {
            this.setState({pages});
        });
    }
}

function isInAnchor (node: any): boolean {
    if (!node) {
        return false;
    }
    else if (node.nodeType === 1 && node.nodeName === 'A') {
        return true;
    }
    return isInAnchor(node.parentNode);
}
