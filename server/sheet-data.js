'use strict';

const google = require('googleapis');
const config = require('./configuration');
const sheets = google.sheets('v4');

function getTaskSheetData (range) {
    const credentials = config.baseConfiguration();
    const request = {
        range,
        spreadsheetId: credentials.GOOGLE_TASK_SHEET_ID,
        auth: credentials.GOOGLE_SHEETS_API_KEY,
        quotaUser: makeId()
    };

    return new Promise((resolve, reject) => {
        sheets.spreadsheets.values.get(request, (error, response) => {
            if (error) {
                console.error('GOOGLE API ERROR:', error);
                reject({
                    error: `Error retrieving data from Google Sheets: ${error.message}`
                });
            }
            else {
                resolve(response);
            }
        });
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

// Make fake id's to pass to quotaUser, so that we don't hit quota limits on the server
function makeId () {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < 5; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
}

function appendRowGoogleSheet(values, sheetID) {
    const credentials = config.baseConfiguration();
    let jwtClient = new google.auth.JWT(
       credentials.GOOGLE_SERVICE_CLIENT_EMAIL,
       null,
       // replace \n in .env variable with actual new lines, which the auth client expects
       credentials.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
       ['https://www.googleapis.com/auth/spreadsheets']);

    return new Promise((resolve, reject) => {
            jwtClient.authorize(function (err, tokens) {
            if (err) {
                reject(err);
            } else {
                var request = {
                    spreadsheetId: sheetID,
                    // supply a cell where data exists, Google decides for itself where the data table ends and appends
                    range: 'A10',
                    resource: {
                        values: [
                            values
                        ]
                    },
                    valueInputOption: 'RAW',
                    auth: jwtClient,
                };
                sheets.spreadsheets.values.append(request, function(err, response) {
                    if (err) {
                        return reject(err);
                    }
                    resolve("Successfully UPDATED!");
                });
            }
        });
    });
}

exports.getDomains = getDomains;
exports.getCurrentTimeframe = getCurrentTimeframe;
exports.addImportantChange = appendRowGoogleSheet;
