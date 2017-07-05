import * as React from 'react';

export default class SelectDiffType extends React.Component<any, any> {
    render () {
        const diffTypes = this.props.diffTypes;
        return (
            <select>
                {diffTypes.map((diffType: any) => <option key={diffType} value={diffType}>{diffType}</option>)};
            </select>
        );
    }
}
