import React from 'react';

/**
 * @typedef DiffSettingsProps
 * @property {string} diffType
 * @property {Function} onRemoveFormattingChange
 * @property {boolean} removeFormatting
 */

/**
 *
 * @class DiffSettings
 * @extends {React.Component}
 * @param {DiffSettingsProps} props

 */
export default class DiffSettings extends React.Component {
  render () {
    const handleChange = (event) => {
      this.props.onRemoveFormattingChange(event.target.checked);
    };

    const renderedDiffTypes = ['SIDE_BY_SIDE_RENDERED', 'HIGHLIGHTED_RENDERED'];
    if (!renderedDiffTypes.includes(this.props.diffType)) {
      return null;
    }

    return (
      <label className="utilities__label">
        <input
          checked={this.props.removeFormatting}
          className="utilities__input"
          onChange={handleChange}
          type="checkbox">
        </input>
        Remove formatting
      </label>
    );
  }
}
