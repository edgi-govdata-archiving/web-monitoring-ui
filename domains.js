const google = require('googleapis');
const sheets = google.sheets('v4');

function getDomains(username) {
    const credentials = credentialConfiguration();
    const request = {
        spreadsheetId: credentials.GOOGLE_TASK_SHEET_ID,
        range: 'A:ZZZ', // extreme range to get whole spreadsheet
        auth: credentials.GOOGLE_SHEETS_API_KEY,
        quotaUser: makeId()
    };

    return new Promise((resolve, reject) => {
        sheets.spreadsheets.values.get(request, function(error, response) {
            if (error) {
                reject(error);
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
    let domains = records.filter(record => {
        return username.toLowerCase() === record[0].toLowerCase()
    })[0];

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

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}


/**
 * Create a credential object with secret values from process.env.
 * In development, also read from a file named .env, if present.
 * @returns {Object}
 */
function credentialConfiguration () {
    let source = Object.assign({}, process.env);;
    if (process.env.NODE_ENV !== 'production') {
        const fromFile = require('dotenv').config();
        // If there is no .env file, don't throw and just use process.env
        if (fromFile.error && fromFile.error.code !== 'ENOENT') {
            throw fromFile.error;
        }

        source = Object.assign(fromFile.parsed || {}, source);
    }
    return source;
}

exports.getDomains = getDomains;
