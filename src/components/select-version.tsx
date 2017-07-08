import * as React from 'react';
import {Version} from '../services/web-monitoring-db';

export default class SelectVersion extends React.Component<any, any> {
    render () {
        const versions = this.props.versions;
        const handleChange = (e: any) => {
          this.props.onChange(versions[e.target.value]);
        }

        return (
            <div>
                <select onChange={handleChange}>
                    <option value="">none</option>
                    {versions.map((v: Version, i: number) => <option key={v.uuid} value={i}>{getDateString(v.capture_time.toString())}</option>)}
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
