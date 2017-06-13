var google = require('googleapis');
var sheets = google.sheets('v4');

function getDomains(username) {
    // TODO: Use env variables
    const credentials = require('./client_secret.json');
    var request = {
        spreadsheetId: credentials.installed.sheet_id,
        range: 'A:ZZZ', // extreme range to get whole spreadsheet
        auth: credentials.installed.api_key
    };

    return new Promise((resolve, reject) => {
        sheets.spreadsheets.values.get(request, function(err, response) {
            if (err) {
                reject(err);
            } else {
                resolve({
                    'domains': findMatch(username, response.values)
                });
            }
        });
    });
}

function findMatch(username, records) {
    let domains = records.filter(record => {
        return username.toLowerCase() === record[0].toLowerCase()
    })[0];

    return domains ? domains.slice(1) : [`${username} not found`];
}

exports.getDomains = getDomains;
