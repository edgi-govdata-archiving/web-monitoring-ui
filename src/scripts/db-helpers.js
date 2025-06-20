/** @typedef {import("luxon").DateTime} DateTime */

/**
 * Takes a date (either a Luxon DateTime or Date object) and returns an ISO date
 * string in UTC time. If there is no date, return an empty string.
 * Throws a TypeError if an invalid value is passed in.
 * @private
 * @param {String|Date|DateTime} date
 *
 * @returns {String}
 */
function _formatDate (date) {
  if (!date) return '';
  else if (date.toISO) return date.toUTC().toISO();
  else if (date.toISOString) return date.toISOString();
  else throw new TypeError(`formatDate only takes Date or luxon.DateTime instances, not ${date.constructor.name}s`);
}

/**
 * Takes a time range and returns a string used for the capture_time query parameter.
 * If the timeRange is already a string, return it, otherwise format the start and end date.
 *
 * @param {String|Object} timeRange
 *
 * @returns {String}
 */
export function formatDateRange (timeRange) {
  if (typeof timeRange === 'string') return timeRange;

  return `${_formatDate(timeRange.startDate)}..${_formatDate(timeRange.endDate)}`;
}
