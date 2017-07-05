import * as React from 'react';
import {Version} from '../services/web-monitoring-db';
import SelectVersion from './select-version';

export interface IDiffViewProps {
    currentVersionsUUID: string;
    currentPageUUID: string;
    html: string;
}

export default class DiffView extends React.Component<IDiffViewProps, any> {
    constructor (props: IDiffViewProps) {
        super (props);
        this.state = {versions: []};
    }
    render () {
        getVersions().then((data: any) => {
            this.setState({versions: data});
        });
        return (
            <div>
                <em>Diff to be displayed here.</em>
                <SelectVersion versions={this.state.versions} />
            </div>
        );
    }
}

function getVersions (): Promise<any> {
    const dataUrl = 'https://web-monitoring-db-staging.herokuapp.com/api/v0/pages/19eb31cc-3a96-4f27-b13a-1dc1d1d03257';

    return fetch(dataUrl)
        .then(blob => blob.json())
        .then((json: any) => {
            const data = json.data;
            return data.versions;
        });
}

function loadIframe (htmlEmbed: string) {
    // inject html
    const iframe = document.getElementById('diff_view');
    iframe.setAttribute('srcdoc', htmlEmbed);

    iframe.onload = () => {
        // inject diff.css to highlight <ins> and <del> elements
        const frm = (frames as any).diff_view.contentDocument;
        const otherhead = frm.getElementsByTagName('head')[0];
        const link = frm.createElement('link');
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('type', 'text/css');
        link.setAttribute('href', `${window.location.origin}/css/diff.css`);
        otherhead.appendChild(link);

        // set iframe height = frame content
        iframe.setAttribute('height', (iframe as any).contentWindow.document.body.scrollHeight);
    };
}
