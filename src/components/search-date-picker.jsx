import { Component } from 'react';
import moment from 'moment';

/**
 * @typedef SearchDatePickerProps
 * @property {({startDate: moment.Moment, endDate: Moment.moment}) => void} onDateSearch
 * @property {Date|moment.Moment} startDate
 * @property {Date|moment.Moment} endDate
 */

/**
 * Renders date picker which allows startDate, endDate or both to be selected.
 * Once a date is selected, onDateSearch function is called with startDate and endDate values.
 * Dates can also be cleared out after selected.
 *
 * @class SearchDatePicker
 * @extends {Component}
 * @param {SearchDatePickerProps} props
 */
export default class SearchDatePicker extends Component {
  constructor (props) {
    super(props);
    this.state = { focusedInput: null };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange (event) {
    const value = event.target.value ? moment(event.target.value) : null;
    this.props.onDateSearch({
      startDate: this.props.startDate,
      endDate: this.props.endDate,
      [event.target.name]: value,
    });
  }

  render () {
    return (
      <>
        <label className="searchDateField">
          From date:
          <input
            type="date"
            name="startDate"
            value={this.props.startDate?.toISOString()?.slice(0, 10) ?? ''}
            onChange={this.handleChange}
          />
        </label>
        <label className="searchDateField">
          To date:
          <input
            type="date"
            name="endDate"
            value={this.props.endDate?.toISOString()?.slice(0, 10) ?? ''}
            onChange={this.handleChange}
          />
        </label>
      </>
    );
  }
}
