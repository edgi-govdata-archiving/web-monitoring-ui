'use strict';

const google = require('googleapis');
const config = require('./configuration');
const sheets = google.sheets('v4');

function getDomains(username) {
    const credentials = config.baseConfiguration();
    const request = {
        spreadsheetId: credentials.GOOGLE_TASK_SHEET_ID,
        range: 'A:ZZZ', // extreme range to get whole spreadsheet
        auth: credentials.GOOGLE_SHEETS_API_KEY,
        quotaUser: makeId()
    };

    return new Promise((resolve, reject) => {
        sheets.spreadsheets.values.get(request, function(error, response) {
            if (error) {
                console.error('GOOGLE API ERROR:', error);
                reject({
                    error: `Error retrieving data from Google Sheets: ${error.message}`
                });
            } else {
                const domains = findMatch(username, response.values);
                if (domains) {
                    resolve({ 'domains': domains })
                } else {
                    reject({ 'error': `${username} not found.`})
                }
            };
        });
    });
}

function findMatch(username, records) {
    let domains = records.find(record => username.toLowerCase() === record[0].toLowerCase());

    if (domains) {
        return domains.slice(1);
    } else {
        return null;
    }
}

// Make fake id's to pass to quotaUser, so that we don't hit quota limits on the server
function makeId()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i=0; i < 5; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
}

exports.getDomains = getDomains;
