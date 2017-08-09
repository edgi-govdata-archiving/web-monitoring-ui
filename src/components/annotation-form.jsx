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

  render() {
    const annotation = this.props.annotation || {};
    const common = {
      formValues: annotation,
      onChange: this._onFieldChange
    };

    const classes = ['annotation-form'];
    if (this.props.collapsed) {
      classes.push('annotation-form--collapsed');
    }

    return (
      <form className={classes.join(' ')}>
        <div className="annotation-form__signifiers">
          <div className="signifier-container">
            <h5>Individual Page Changes</h5>
            <ul className="signifier-list">
              <Checkbox {...common} name="indiv_1">Date and time change only</Checkbox>
              <Checkbox {...common} name="indiv_2">Text or numeric content removal or change</Checkbox>
              <Checkbox {...common} name="indiv_3">Image content removal or change</Checkbox>
              <Checkbox {...common} name="indiv_4">Hyperlink removal or change</Checkbox>
              <Checkbox {...common} name="indiv_5">Text-box, entry field, or interactive component removal or change</Checkbox>
              <Checkbox {...common} name="indiv_6">Page removal (whether it has happened in the past or is currently removed)</Checkbox>

            </ul>
          </div>
          <div className="signifier-container">
            <h5>Repeated Changes</h5>
            <ul className="signifier-list">
              <Checkbox {...common} name="repeat_7">Header menu removal or change</Checkbox>
              <Checkbox {...common} name="repeat_8">Template text, page format, or comment field removal or change</Checkbox>
              <Checkbox {...common} name="repeat_9">Footer or site map removal or change</Checkbox>
              <Checkbox {...common} name="repeat_10">Sidebar removal or change</Checkbox>
              <Checkbox {...common} name="repeat_11">Banner/advertisement removal or change</Checkbox>
              <Checkbox {...common} name="repeat_12">Scrolling news/reports</Checkbox>
            </ul>
          </div>
          <div className="signifier-container">
            <h5>Significance</h5>
            <ul className="signifier-list">
              <Checkbox {...common} name="sig_1">Change related to energy, environment, or climate</Checkbox>
              <Checkbox {...common} name="sig_2">Language is significantly altered</Checkbox>
              <Checkbox {...common} name="sig_3">Content is removed</Checkbox>
              <Checkbox {...common} name="sig_4">Page is removed</Checkbox>
              <Checkbox {...common} name="sig_5">Insignificant</Checkbox>
              <Checkbox {...common} name="sig_6">Repeated Insignificant</Checkbox>
            </ul>
          </div>
        </div>

        <textarea
          name="further-notes"
          placeholder="Further notes"
          onChange={this._onNotesChange}
          value={annotation.notes || ''}
        />
      </form>
    );
  }

  _onFieldChange(valueObject) {
    if (this.props.onChange) {
      const newAnnotation = Object.assign({}, this.props.annotation, valueObject);
      this.props.onChange(newAnnotation);
    }
  }

  _onNotesChange(event) {
    this._onFieldChange({ notes: event.target.value });
  }
}

AnnotationForm.defaultProps = {
  annotation: null,
  collapsed: true
};

function Checkbox({ children, formValues, name, onChange }) {
  const fieldNumber = name.split('_')[1];
  const checked = !!(formValues && formValues[name]);
  const changeHandler = (event) =>
    onChange({ [name]: event.currentTarget.checked });
  return (
    <li className="signifier-list-item">
      <input type="checkbox" className="toggle" id={name} checked={checked} onChange={changeHandler} />
      <label data-tip={children} data-for={`${name}-tip`} className="toggle-btn" data-tg-on={fieldNumber} htmlFor={name} />
      <span className="info-text">{children}</span>
      <Tooltip id={`${name}-tip`} place="top" />
    </li>
  );
}
