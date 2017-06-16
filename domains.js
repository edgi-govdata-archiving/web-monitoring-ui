const google = require('googleapis');
const sheets = google.sheets('v4');

function getDomains(username) {
    const credentials = credentialConfiguration();
    const request = {
        spreadsheetId: credentials.TASK_SHEET_ID,
        range: 'A:ZZZ', // extreme range to get whole spreadsheet
        auth: credentials.API_KEY
    };

    return new Promise((resolve, reject) => {
        sheets.spreadsheets.values.get(request, function(err, response) {
            if (err) {
                reject(err);
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

let baseEnvironment;

/**
 * Create a credential object with secret values from process.env.
 * In development, also read from a file named .env, if present.
 * @returns {Object}
 */
function credentialConfiguration () {
    baseEnvironment = baseEnvironment || Object.assign({}, process.env);

    let source = baseEnvironment;
    if (process.env.NODE_ENV !== 'production') {
        const fromFile = require('dotenv').config();
        // If there is no .env file, don't throw and just use process.env
        if (fromFile.error && fromFile.error.code !== 'ENOENT') {
            throw fromFile.error;
        }

        source = Object.assign(fromFile.parsed || {}, baseEnvironment);
    }

    const allowedFields = [
        'TASK_SHEET_ID',
        'API_KEY'
    ];

    return allowedFields.reduce((result, field) => {
        result[field] = source[field];
        return result;
    }, {});
}

exports.getDomains = getDomains;
