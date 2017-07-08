import * as React from 'react';
import {diffTypes} from '../constants/DiffTypes';

export default class SelectDiffType extends React.Component<any, any> {

    render () {
        // const diffTypes = this.props.diffTypes;
        const handleChange = (e: any) => {
          this.props.onChange(e.target.value);
        }

        return (
            <select value={this.props.value} onChange={handleChange}>
              {Object.keys(diffTypes).map((key) => {
                var val = diffTypes[key];
                return <option key={key} value={key}>{val}</option>
              })}
              {/*diffTypes.map((diffType: any) => <option key={diffType} value={diffType}>{diffType}</option>)};*/}
            </select>
        );
    }
}
