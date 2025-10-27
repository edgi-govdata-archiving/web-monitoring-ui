export let dateFormatter;

// Intl.DateTimeFormat is available in most engines, but not *everywhere.*
if (globalThis.Intl && globalThis.Intl.DateTimeFormat) {
  dateFormatter = new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    month: 'long',
    second: 'numeric',
    year: 'numeric',
    timeZoneName: 'short'
  });
}
else {
  // This follows the same basic API as Intl.DateTimeFormat, but returns a very
  // simple old-school localized date. It won't have perfect formatting, but it
  // works and is minimally complex.
  dateFormatter = {
    format (date) {
      return date.toLocaleString();
    }
  };
}


export const formatMaintainers = maintainers => maintainers.map(maintainership => maintainership.name).join(', ');

export const formatSites = tags => {
  const sitePrefix = 'site:';
  return tags
    .filter(tagging => tagging.name.startsWith(sitePrefix))
    .map(tagging => tagging.name.slice(sitePrefix.length))
    .join(', ');
};

/**
 * Format a number to a maximum number of decimal places, removing trailing zeros
 * @param {number} value - The number to format
 * @param {number} maxDecimals - Maximum number of decimal places
 * @returns {number}
 */
export const formatDecimalPlaces = (value, maxDecimals) => {
  return parseFloat(value.toFixed(maxDecimals));
};

/**
 * Convert bytes to human readable format
 * @param {number} bytes
 * @returns {string}
 */
export const humanReadableSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const cappedIndex = Math.min(i, sizes.length - 1);
  const sizeUnit = sizes[cappedIndex];
  return formatDecimalPlaces(bytes / Math.pow(k, cappedIndex), 2) + ' ' + sizeUnit;
};
