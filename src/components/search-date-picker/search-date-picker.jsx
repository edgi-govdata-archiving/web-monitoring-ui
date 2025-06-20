import { DateTime } from 'luxon';
import styles from './search-date-picker.css';

/**
 * @typedef SearchDatePickerProps
 * @property {({startDate: DateTime|null, endDate: DateTime|null}) => void} onDateSearch
 * @property {DateTime?} startDate
 * @property {DateTime?} endDate
 */

/**
 * Renders date picker which allows startDate, endDate or both to be selected.
 * Once a date is selected, onDateSearch function is called with startDate and endDate values.
 * Dates can also be cleared out after selected.
 *
 * @param {SearchDatePickerProps} props
 */
export default function SearchDatePicker ({ onDateSearch, startDate = null, endDate = null }) {
  function handleChange (event) {
    const value = event.target.value ? DateTime.fromISO(event.target.value) : null;
    onDateSearch({
      startDate,
      endDate,
      [event.target.name]: value,
    });
  }

  return (
    <>
      <label className={styles.searchDateField}>
        From date:
        <input
          type="date"
          name="startDate"
          value={startDate?.toISODate() ?? ''}
          onChange={handleChange}
          max={DateTime.now().toISODate()}
        />
      </label>
      <label className={styles.searchDateField}>
        To date:
        <input
          type="date"
          name="endDate"
          value={endDate?.toISODate() ?? ''}
          onChange={handleChange}
          max={DateTime.now().plus({ days: 1 }).toISODate()}
        />
      </label>
    </>
  );
}
