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

exports.getDomains = getDomains;
