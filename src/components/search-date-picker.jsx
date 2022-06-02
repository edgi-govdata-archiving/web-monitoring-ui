import { Component } from 'react';
import 'react-dates/initialize';
import { DateRangePicker } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';
import moment from 'moment';
import { isInclusivelyBeforeDay } from 'react-dates';

/**
 * @typedef SearchDatePickerProps
 * @property {({startDate: Moment, endDate: Moment}) => void} onDateSearch
 * @property {Date} startDate
 * @property {Date} endDate
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
  }

  render () {
    return (
      <DateRangePicker
        startDateId={'startDate' + (this.props.inputIdSuffix || '')}
        endDateId={'endDate' + (this.props.inputIdSuffix || '')}
        startDate={this.props.startDate}
        endDate={this.props.endDate}
        onDatesChange={this.props.onDateSearch}
        focusedInput={this.state.focusedInput}
        onFocusChange={(focusedInput) => { this.setState({ focusedInput });}}
        isOutsideRange={day => !isInclusivelyBeforeDay(day, moment())}
        readOnly
        showClearDates />
    );
  }
}
