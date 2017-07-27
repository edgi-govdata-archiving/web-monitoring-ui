import * as React from 'react';
import {Version} from '../services/web-monitoring-db';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    month: 'long',
    second: 'numeric',
    year: 'numeric'
});

export default class SelectVersion extends React.PureComponent<any, any> {
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
                    {dateFormatter.format(version.capture_time)}
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
