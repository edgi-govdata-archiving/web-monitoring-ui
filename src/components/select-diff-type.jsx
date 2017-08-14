import React from 'react';
import {diffTypes} from '../constants/diff-types';

/**
 * A dropdown select box for types of diffs
 *
 * @class SelectDiffType
 * @extends {React.Component}
 * @param {Object} props
 * @param {string} value Identifier for the selected diff type
 * @param {Function} onChange Callback when a new value is selected. Signature:
 *                            `string => void`
 */
export default class SelectDiffType extends React.Component {
  render () {
    // const diffTypes = this.props.diffTypes;
    const handleChange = (event) => {
      this.props.onChange(event.target.value);
    };

    return (
      <select value={this.props.value} onChange={handleChange}>
        <option value="">none</option>
        {Object.keys(diffTypes).map((key) => {
          var val = diffTypes[key];
          return <option key={key} value={key}>{val}</option>;
        })}
      </select>
    );
  }
}
