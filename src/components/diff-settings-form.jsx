import { PureComponent } from 'react';

// Diff types that we can remove formatting from
const typesWithFormatting = ['SIDE_BY_SIDE_RENDERED', 'HIGHLIGHTED_RENDERED'];

// Shallow-merge multiple objects
const mergeObjects = (...objects) => Object.assign({}, ...objects);

/**
 * @typedef DiffSettingsFormProps
 * @property {string} diffType The current diff type to render controls for
 * @property {object} settings An object containing the current diff settings
 * @property {(object) => any} onChange Called when the settings are changed
 */

/**
 * A form for changing settings related to a diff, like whether to remove
 * formatting from it.
 * @extends {PureComponent}
 * @param {DiffSettingsFormProps} props
 */
export default class DiffSettingsForm extends PureComponent {
  constructor (props) {
    super(props);

    this._handleCheckboxChange = this._handleCheckboxChange.bind(this);
  }

  render () {
    if (!typesWithFormatting.includes(this.props.diffType)) {
      return null;
    }

    return (
      <form>
        <label className="utilities__label">
          <input
            checked={this.props.settings.removeFormatting}
            className="utilities__input"
            name="removeFormatting"
            onChange={this._handleCheckboxChange}
            type="checkbox">
          </input>
          Remove formatting
        </label>

        <label className="utilities__label">
          <input
            checked={this.props.settings.useWaybackResources}
            className="utilities__input"
            name="useWaybackResources"
            onChange={this._handleCheckboxChange}
            type="checkbox">
          </input>
          Load Resources from Wayback Machine
        </label>
      </form>
    );
  }

  _handleCheckboxChange (event) {
    const field = event.target.name;
    this.props.onChange(mergeObjects(this.props.settings, {
      [field]: event.target.checked
    }));
  }
}
