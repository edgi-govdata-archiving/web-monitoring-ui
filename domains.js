var google = require('googleapis');
var sheets = google.sheets('v4');

function getDomains(username, config) {
    var request = {
        spreadsheetId: config.TASK_SHEET_ID,
        range: 'A:ZZZ', // extreme range to get whole spreadsheet
        auth: config.API_KEY
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
