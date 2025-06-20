import { Component } from 'react';
import { DateTime } from 'luxon';
import styles from './search-date-picker.css';

/**
 * @typedef SearchDatePickerProps
 * @property {({startDate: DateTime, endDate: DateTime}) => void} onDateSearch
 * @property {DateTime} startDate
 * @property {DateTime} endDate
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
    const value = event.target.value ? DateTime.fromISO(event.target.value) : null;
    this.props.onDateSearch({
      startDate: this.props.startDate,
      endDate: this.props.endDate,
      [event.target.name]: value,
    });
  }

  render () {
    return (
      <>
        <label className={styles.searchDateField}>
          From date:
          <input
            type="date"
            name="startDate"
            value={this.props.startDate?.toISODate() ?? ''}
            onChange={this.handleChange}
            max={DateTime.now().toISODate()}
          />
        </label>
        <label className={styles.searchDateField}>
          To date:
          <input
            type="date"
            name="endDate"
            value={this.props.endDate?.toISODate() ?? ''}
            onChange={this.handleChange}
            max={DateTime.now().plus({ days: 1 }).toISODate()}
          />
        </label>
      </>
    );
  }
}
