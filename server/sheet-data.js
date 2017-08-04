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

/**
 * Appends record to google sheet
 *
 * @param {string[]} [values] Column values of row record in an array
 * @param {string}   [sheetID] Sheet ID of google spreadsheet
 * @param {Object}   [configuration] baseConfiguration holding .env variables
 * @returns {Promise<string>} Simple 'ok' message for now
 */
function appendRowGoogleSheet(values, sheetID) {
  return addAuthentication({
    spreadsheetId: sheetID,
    // supply a cell where data exists, Google decides for itself where the data table ends and appends, using extreme range again to grab everything
    range: 'B3:ZZZ',
    resource: {
      values: [
        values
      ]
    },
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS'
  })
    .then(promisable(sheets.spreadsheets.values.append))
    .then(() => 'Successfully UPDATED!');
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
    if (!authTokens || Date.now() > authTokens.expiry_date - 30000) {
      const configuration = config.baseConfiguration();
      const clientEmail = configuration.GOOGLE_SERVICE_CLIENT_EMAIL;
      // replaces \n in .env variable with actual new lines, which the auth client expects
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

exports.getDomains = getDomains;
exports.getCurrentTimeframe = getCurrentTimeframe;
exports.appendRowGoogleSheet = appendRowGoogleSheet;
