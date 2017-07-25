import * as React from 'react';
import {Version} from '../services/web-monitoring-db';

export default class SelectVersion extends React.Component<any, any> {
    render () {
        const value = this.props.value ? this.props.value.uuid : '';
        const versions = this.props.versions;
        const handleChange = (e: any) => {
            const newValue = e.target.value;
            this.props.onChange(versions.find((v: any) => v.uuid === newValue));
        };

        const options = versions.map((version: Version, index: number) => {
            return (
                <option key={version.uuid} value={version.uuid}>
                    {getDateString(version.capture_time)}
                </option>
            );
        });

        return (
            <select onChange={handleChange} value={value}>
                <option value="">none</option>
                {options}
            </select>
        );
    }
}

function getDateString (date: Date): string {
    const options = {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    };
    return `${date.toLocaleDateString('en-US', options)} ${date.toLocaleTimeString('en-US')}`;
}
