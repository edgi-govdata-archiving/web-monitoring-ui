import { formatDateRange } from '../db-helpers';
import { DateTime } from 'luxon';

describe('db-helpers', () => {
  test('formatDateRange returns correct query parameter value when DateTime object is passed in', () => {
    const startDate = DateTime.fromISO('2019-10-26T21:00:00-08:00');
    const endDate = DateTime.fromISO('2019-10-27T21:00:00-08:00');
    const dateRangeString = formatDateRange({ startDate, endDate });

    expect(dateRangeString).toBe('2019-10-27T05:00:00.000Z..2019-10-28T05:00:00.000Z');
  });

  test('formatDateRange returns correct query parameter value when date object is passed in', () => {
    const startDate = new Date('26 Oct 2019 21:00:00 EST');
    const endDate = new Date('27 Oct 2019 21:00:00 EST');
    const dateRangeString = formatDateRange({ startDate, endDate });

    expect(dateRangeString).toBe('2019-10-27T02:00:00.000Z..2019-10-28T02:00:00.000Z');
  });
});
