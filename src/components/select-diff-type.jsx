import React from 'react';

/**
 * A dropdown select box for types of diffs
 *
 * @class SelectDiffType
 * @extends {React.Component}
 * @param {Object} props
 * @param {string} value Identifier for the selected diff type
 * @param {Function} onChange Callback when a new value is selected. Signature:
 *                            `string => void`
 * @param {DiffType[]} types
 */
export default class SelectDiffType extends React.Component {
  render () {
    const handleChange = (event) => {
      this.props.onChange(event.target.value);
    };

    return (
      <select value={this.props.value} onChange={handleChange}>
        <option value="">none</option>
        {this.props.types.map(this._renderOption)}
      </select>
    );
  }

  _renderOption (diffType) {
    return <option key={diffType.value} value={diffType.value}>{diffType.description}</option>;
  }
}
