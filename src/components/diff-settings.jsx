import React from 'react';

// Diff types that we can remove formatting from
const typesWithFormatting = ['SIDE_BY_SIDE_RENDERED', 'HIGHLIGHTED_RENDERED'];

/**
 * @typedef DiffSettingsProps
 * @property {string} diffType The current diff type to render controls for
 * @property {object} settings An object containing the current diff settings
 * @property {(object) => any} onChange Called when the settings are changed
 */

/**
 * A form for changing settings related to a diff, like whether to remove
 * formatting from it.
 * @extends {React.PureComponent}
 * @param {DiffSettingsProps} props
 */
export default class DiffSettings extends React.PureComponent {
  constructor (props) {
    super(props);

    this._handleRemoveFormattingChange = this._handleRemoveFormattingChange.bind(this);
  }

  render () {
    if (!typesWithFormatting.includes(this.props.diffType)) {
      return null;
    }

    return (
      <label className="utilities__label">
        <input
          checked={this.props.settings.removeFormatting}
          className="utilities__input"
          onChange={this._handleRemoveFormattingChange}
          type="checkbox">
        </input>
        Remove formatting
      </label>
    );
  }

  _handleRemoveFormattingChange (event) {
    this.props.onChange({
      removeFormatting: event.target.checked
    });
  }
}
