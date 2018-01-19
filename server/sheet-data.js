'use strict';

const google = require('googleapis');
const config = require('./configuration');
const sheets = google.sheets('v4');

function getTaskSheetData (range) {
  const configuration = config.baseConfiguration();
  return addAuthentication({
    range,
    spreadsheetId: configuration.GOOGLE_TASK_SHEET_ID
  })
    .then(promisable(sheets.spreadsheets.values.get))
    .catch(error => {
      console.error('GOOGLE API ERROR:', error);
      throw {
        error: `Error retrieving data from Google Sheets: ${error.message}`
      };
    });
}

function getDomains (username) {
  return getTaskSheetData('A2:ZZZ') // extreme range to get whole spreadsheet
    .then(response => {
      const domains = findUserRecord(username, response.values);
      if (domains) {
        return {domains};
      }
      else {
        throw {
          error: `${username} not found.`,
          status: 404
        };
      }
    });
}

function findUserRecord (username, records) {
  const lowerName = username.toLowerCase();
  const domains = records.find(record => lowerName === record[0].toLowerCase());

  return domains ? domains.slice(1) : null;
}

function getCurrentTimeframe (date) {
  return getTaskSheetData('Timeframes!A2:B')
    .then(response => {
      const now = date ? date.getTime() : Date.now();
      const frame = findLatestTimeframe(response.values, now);

      const intervals = Math.floor((now - frame.start) / frame.duration);
      const currentStart = frame.start + (intervals - 1) * frame.duration;
      const currentEnd = currentStart + frame.duration;

      return {
        start: (new Date(currentStart)).toISOString(),
        end: (new Date(currentEnd)).toISOString(),
        duration: frame.duration
      };
    });
}

function findLatestTimeframe (rows, relativeToDate) {
  for (let i = rows.length - 1; i >= 0; i--) {
    const rowDate = new Date(rows[i][0]).getTime();
    const rowDuration = parseFloat(rows[i][1]) * 1000;
    if (rowDate + rowDuration <= relativeToDate) {
      return {
        start: rowDate,
        duration: rowDuration
      };
    }
  }

  throw {error: 'No timeframes contain the current date.'};
}

function addChangeToDictionary (data) {
  const versionista = data.to_version.source_type === 'versionista'
    && data.to_version.source_metadata;

  const row = [
    // Index
    '',
    // UUID
    `${data.from_version.uuid}..${data.to_version.uuid}`,
    // Output Date/Time
    formatDate(),
    // Agency
    data.page.agency,
    // Site Name
    data.page.site,
    // Page Name
    data.page.title,
    // URL
    data.page.url,
    // Page View URL
    // TODO: should these all be the web-monitoring-ui URLs instead?
    versionista ? `https://versionista.com/${versionista.site_id}/${versionista.page_id}/` : '',
    // Last Two - Side by Side
    versionista ? versionista.diff_with_previous_url : '',
    // Latest to Base - Side by Side
    versionista ? versionista.diff_with_first_url : '',
    // Date Found - Latest
    formatDate(data.from_version.capture_time),
    // Date Found - Base
    '', // we don't have this information
    // Diff Hash
    versionista ? versionista.diff_hash : '',
    // Diff Length
    versionista ? versionista.diff_length : '',
    // Who Found This?
    data.user,
    // Classification
    '',
    // Description
    data.annotation && data.annotation.notes || ''
  ];

  return appendRowToSheet(
    row,
    config.baseConfiguration().GOOGLE_DICTIONARY_SHEET_ID
  )
    .then(() => ({success: 'appended'}));
}

function addChangeToImportant (data) {
  const versionista = data.to_version.source_type === 'versionista'
    && data.to_version.source_metadata;
  const annotation = data.annotation || {};

  const row = [
    // Checked
    '',
    // Index
    '',
    // Unique ID
    `${data.from_version.uuid}..${data.to_version.uuid}`,
    // Output Date/Time
    formatDate(),
    // Agency
    data.page.agency,
    // Site Name
    data.page.site,
    // Page Name
    data.page.title,
    // URL
    data.page.url,
    // Page View URL
    // TODO: should these all be the web-monitoring-ui URLs instead?
    versionista ? `https://versionista.com/${versionista.site_id}/${versionista.page_id}/` : '',
    // Last Two - Side by Side
    versionista ? versionista.diff_with_previous_url : '',
    // Latest to Base - Side by Side
    versionista ? versionista.diff_with_first_url : '',
    // Date Found - Latest
    formatDate(data.from_version.capture_time),
    // Date Found - Base
    '', // we don't have this information
    // Diff Length
    versionista ? versionista.diff_length : '',
    // Diff Hash
    versionista ? versionista.diff_hash : '',
    // Text diff length
    versionista ? versionista.diff_text_length : '',
    // Text diff hash
    versionista ? versionista.diff_text_hash : '',
    // Who Found This?
    data.user,
    // 1
    annotation.indiv_1 ? 'y' : '',
    // 2
    annotation.indiv_2 ? 'y' : '',
    // 3
    annotation.indiv_3 ? 'y' : '',
    // 4
    annotation.indiv_4 ? 'y' : '',
    // 5
    annotation.indiv_5 ? 'y' : '',
    // 6
    annotation.indiv_6 ? 'y' : '',
    // 7
    annotation.repeat_7 ? 'y' : '',
    // 8
    annotation.repeat_8 ? 'y' : '',
    // 9
    annotation.repeat_9 ? 'y' : '',
    // 10
    annotation.repeat_10 ? 'y' : '',
    // 11
    annotation.repeat_11 ? 'y' : '',
    // 12
    annotation.repeat_12 ? 'y' : '',
    // 1
    annotation.sig_1 ? 'y' : '',
    // 2
    annotation.sig_2 ? 'y' : '',
    // 3
    annotation.sig_3 ? 'y' : '',
    // 4
    annotation.sig_4 ? 'y' : '',
    // 5
    annotation.sig_5 ? 'y' : '',
    // 6
    annotation.sig_6 ? 'y' : '',
    // Choose from drop down menu (2 columns)
    '', '',
    // Leave blank (used on Patterns sheet)
    '',
    // Further Notes
    annotation.notes || ''
  ];

  return appendRowToSheet(
    row,
    config.baseConfiguration().GOOGLE_IMPORTANT_CHANGE_SHEET_ID,
    'A6:AN6'
  )
    .then(() => ({success: 'appended'}));
}

/**
 * Append a row to a google sheet
 *
 * @param {string[]} values Column values of row  to append
 * @param {string}   spreadsheedId ID of Google sheet to append to
 * @param {string}   [range] Range identifying the data to append to in sheet,
 *   e.g. `A3:Z3`. This is NOT the range after which to append -- Google sheets
 *   identifies a continuous series of rows that intersect with this range and
 *   appends *after those rows.*
 * @returns {Promise<Object>} Response data from Google Sheets
 */
function appendRowToSheet(values, spreadsheetId, range = 'A3:ZZZ') {
  return addAuthentication({
    spreadsheetId,
    // supply a cell where data exists, Google decides for itself where the data table ends and appends, using extreme range again to grab everything
    range,
    resource: {
      values: [values]
    },
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS'
  })
    .then(promisable(sheets.spreadsheets.values.append));
}


// ------------------- PRIVATE UTILITIES -----------------------

let authTokens;
let authClient;

/**
 * Add authentication information to a request object for Google API calls.
 * If there is an authenticated client on hand, it will be used. Otherwise,
 * a new authenticated client will be created and logged in before returning
 * the object with authentication information.
 * @private
 * @param {Object} requestData
 * @returns {Promise<Object>} requestData modified with auth client
 */
function addAuthentication (requestData) {
  return new Promise((resolve, reject) => {
    // If tokens expire in 30 seconds or less, refresh them.
    const expirationLeeway = 30000;
    if (!authTokens || Date.now() > authTokens.expiry_date - expirationLeeway) {
      const configuration = config.baseConfiguration();
      const clientEmail = configuration.GOOGLE_SERVICE_CLIENT_EMAIL;
      // Replace `\n` in ENV variable with actual line breaks.
      const privateKey = configuration.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n');

      authClient = new google.auth.JWT(
        clientEmail,
        null,
        privateKey,
        ['https://www.googleapis.com/auth/spreadsheets']);

      authClient.authorize((error, tokens) => {
        if (error) return reject(error);
        authTokens = tokens;
        resolve(Object.assign({auth: authClient}, requestData));
      });
    }
    else {
      resolve(Object.assign({auth: authClient}, requestData));
    }
  });
}

/**
 * Convert a callback-based async function into a promise-based function.
 * @param {Function} functionWithCallback
 * @returns {Function} Function that returns a promise
 */
function promisable (functionWithCallback) {
  return (...input) => {
    return new Promise((resolve, reject) => {
      const callback = (error, result) => {
        if (error) return reject(error);
        resolve(result);
      };
      functionWithCallback.apply(null, [...input, callback]);
    });
  };
}

function formatDate (date) {
  if (!date) {
    date = new Date();
  }
  else if (typeof date === 'string') {
    date = new Date(date);
  }

  return date
    .toISOString()
    .replace('T', ' ')
    .replace(/(\d\d)\.\d+/, '$1')
    .replace('Z', ' GMT');
}

exports.getDomains = getDomains;
exports.getCurrentTimeframe = getCurrentTimeframe;
exports.addChangeToDictionary = addChangeToDictionary;
exports.addChangeToImportant = addChangeToImportant;
