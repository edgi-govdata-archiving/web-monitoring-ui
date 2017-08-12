import React from 'react';
import Tooltip from 'react-tooltip';
import { Version } from '../services/web-monitoring-db';

/**
 * @typedef {Object} AnnotationFormProps
 * @property {Object} annotation
 * @property {boolean} [collapsed=true]
 * @property {Function} [onChange] Callback for changes to the annotation. It
 *   should be of the signature `(annotation) => void`
 */

/**
 * Form layout for marking/viewing simple annotations of changes.
 *
 * @class AnnotationForm
 * @extends {React.Component}
 * @param {AnnotationFormProps} props
 */
export default class AnnotationForm extends React.Component {
  constructor(props) {
    super(props);
    this._onFieldChange = this._onFieldChange.bind(this);
    this._onNotesChange = this._onNotesChange.bind(this);
  }

  render () {
    const annotation = this.props.annotation || {};
    const common = {
      formValues: annotation,
      onChange: this._onFieldChange,
      collapsed: this.props.collapsed
    };

    const classes = ['annotation-form'];
    if (this.props.collapsed) {
      classes.push('annotation-form--collapsed');
    }

    return (
      <form className={classes.join(' ')}>
        <div className="annotation-form__signifiers">
          <fieldset>
            <legend>Individual Page Changes</legend>
            <ol className="signifier-list">
              <Checkbox {...common} name="indiv_1">Date and time change only</Checkbox>
              <Checkbox {...common} name="indiv_2">Text or numeric content removal or change</Checkbox>
              <Checkbox {...common} name="indiv_3">Image content removal or change</Checkbox>
              <Checkbox {...common} name="indiv_4">Hyperlink removal or change</Checkbox>
              <Checkbox {...common} name="indiv_5">Text-box, entry field, or interactive component removal or change</Checkbox>
              <Checkbox {...common} name="indiv_6">Page removal (whether it has happened in the past or is currently removed)</Checkbox>
            </ol>
          </fieldset>
          <fieldset>
            <legend>Repeated Changes</legend>
            <ol className="signifier-list">
              <Checkbox {...common} name="repeat_7">Header menu removal or change</Checkbox>
              <Checkbox {...common} name="repeat_8">Template text, page format, or comment field removal or change</Checkbox>
              <Checkbox {...common} name="repeat_9">Footer or site map removal or change</Checkbox>
              <Checkbox {...common} name="repeat_10">Sidebar removal or change</Checkbox>
              <Checkbox {...common} name="repeat_11">Banner/advertisement removal or change</Checkbox>
              <Checkbox {...common} name="repeat_12">Scrolling news/reports</Checkbox>
            </ol>
          </fieldset>
          <fieldset>
            <legend>Significance</legend>
            <ol className="signifier-list">
              <Checkbox {...common} name="sig_1">Change related to energy, environment, or climate</Checkbox>
              <Checkbox {...common} name="sig_2">Language is significantly altered</Checkbox>
              <Checkbox {...common} name="sig_3">Content is removed</Checkbox>
              <Checkbox {...common} name="sig_4">Page is removed</Checkbox>
              <Checkbox {...common} name="sig_5">Insignificant</Checkbox>
              <Checkbox {...common} name="sig_6">Repeated Insignificant</Checkbox>
            </ol>
          </fieldset>
        </div>

        <textarea
          name="notes"
          placeholder="Further notes"
          onChange={this._onNotesChange}
          value={annotation.notes || ''}
        />

        <Tooltip
          id="annotation-tooltip"
          place="top"
          disable={!this.props.collapsed}
          effect="solid" />
      </form>
    );
  }

  _onFieldChange (valueObject) {
    if (this.props.onChange) {
      const newAnnotation = Object.assign({}, this.props.annotation, valueObject);
      this.props.onChange(newAnnotation);
    }
  }

  _onNotesChange (event) {
    this._onFieldChange({ notes: event.target.value });
  }
}

AnnotationForm.defaultProps = {
  annotation: null,
  collapsed: true
};

function Checkbox ({ children, formValues, name, onChange, collapsed }) {
  const fieldNumber = name.split('_')[1];
  const checked = !!(formValues && formValues[name]);
  const uuid = getUUID();
  const changeHandler = (event) =>
    onChange({ [name]: event.currentTarget.checked });
  return (
    <li className="signifier-list-item">
      <input
        checked={checked}
        className="toggle"
        id={uuid}
        onChange={changeHandler}
        type="checkbox"
        />
      <label
        className="toggle-btn"
        data-for="annotation-tooltip"
        data-tip={children}
        data-fieldNumber={fieldNumber}
        htmlFor={uuid}>
          { collapsed ? "" : <span>{children}</span> }
      </label>
    </li>
  );
}

// Unique IDs - https://gist.github.com/jed/982883
function getUUID(a){return a?(a^Math.random()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,getUUID)}
