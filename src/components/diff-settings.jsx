import React from 'react';

/**
 * @typedef DiffSettingsProps
 * @property {object} diffSettings
 * @property {string} diffType
 * @property {Function} handleRemoveFormattingChange
 */

/**
 *
 * @class DiffSettings
 * @extends {React.PureComponent}
 * @param {DiffSettingsProps} props

 */
export default class DiffSettings extends React.PureComponent {
  constructor (props) {
    super(props);

    this._handleRemoveFormattingChange = this._handleRemoveFormattingChange.bind(this);
  }

  render () {
    const renderedDiffTypes = ['SIDE_BY_SIDE_RENDERED', 'HIGHLIGHTED_RENDERED'];
    if (!renderedDiffTypes.includes(this.props.diffType)) {
      return null;
    }

    return (
      <label className="utilities__label">
        <input
          checked={this.props.diffSettings.removeFormatting}
          className="utilities__input"
          onChange={this._handleRemoveFormattingChange}
          type="checkbox">
        </input>
        Remove formatting
      </label>
    );
  }

  _handleRemoveFormattingChange (event) {
    this.props.handleRemoveFormattingChange(event.target.checked);
  }
}
