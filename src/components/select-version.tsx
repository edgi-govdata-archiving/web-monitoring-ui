import * as React from 'react';
import {RouteComponentProps} from 'react-router-dom';
import {Version} from '../services/web-monitoring-db';

export default class SelectVersion extends React.Component<any, any> {
    render () {
        const versions = this.props.versions;
        return (
            <div>
                <select>
                    {versions.map((v: Version) => <option key={v.uuid} value={v.uuid}>{getDateString(v.capture_time.toString())}</option>)}
                </select>
            </div>
        );
    }
}

function getDateString (str: string): string {
    const date = new Date(str);
    const options = {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    };
    return `${date.toLocaleDateString('en-US', options)} ${date.toLocaleTimeString('en-US')}`;
}
