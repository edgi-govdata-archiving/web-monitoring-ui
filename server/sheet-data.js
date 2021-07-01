'use strict';

const googleSheets = require('@googleapis/sheets');
const config = require('./configuration');
const sheets = googleSheets.sheets('v4');
const formatters = require('../src/scripts/formatters');

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
    // Maintainers
    formatters.formatMaintainers(data.page.maintainers),
    // Sites
    formatters.formatSites(data.page.tags),
    // Page Name
    data.page.title,
    // URL
    data.page.url,
    // Page View URL
    `https://monitoring.envirodatagov.org/page/${data.page.uuid}`,
    // Last Two - Side by Side
    `https://monitoring.envirodatagov.org/page/${data.page.uuid}/..${data.to_version.uuid}`,
    // Latest to Base - Side by Side
    `https://monitoring.envirodatagov.org/page/${data.page.uuid}/^..${data.to_version.uuid}`,
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
    .then(() => ({ success: 'appended' }));
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
    // Maintainers
    formatters.formatMaintainers(data.page.maintainers),
    // Sites
    formatters.formatSites(data.page.tags),
    // Page Name
    data.page.title,
    // URL
    data.page.url,
    // Page View URL
    `https://monitoring.envirodatagov.org/page/${data.page.uuid}`,
    // Last Two - Side by Side
    `https://monitoring.envirodatagov.org/page/${data.page.uuid}/..${data.to_version.uuid}`,
    // Latest to Base - Side by Side
    `https://monitoring.envirodatagov.org/page/${data.page.uuid}/^..${data.to_version.uuid}`,
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
    .then(() => ({ success: 'appended' }));
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
function appendRowToSheet (values, spreadsheetId, range = 'A3:ZZZ') {
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
    .then(args => sheets.spreadsheets.values.append(args));
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

      authClient = new googleSheets.auth.JWT(
        clientEmail,
        null,
        privateKey,
        ['https://www.googleapis.com/auth/spreadsheets']);

      authClient.authorize((error, tokens) => {
        if (error) return reject(error);
        authTokens = tokens;
        resolve(Object.assign({ auth: authClient }, requestData));
      });
    }
    else {
      resolve(Object.assign({ auth: authClient }, requestData));
    }
  });
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

exports.addChangeToDictionary = addChangeToDictionary;
exports.addChangeToImportant = addChangeToImportant;
