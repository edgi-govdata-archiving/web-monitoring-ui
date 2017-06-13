var google = require('googleapis');
var sheets = google.sheets('v4');

function getDomains() {
    // TODO: Use env variables
    const credentials = require('./client_secret.json');
    var request = {
        // The ID of the spreadsheet to retrieve data from.
        spreadsheetId: credentials.installed.sheet_id,

        // The A1 notation of the values to retrieve.
        range: 'A:ZZ',

        // How values should be represented in the output.
        // The default render option is ValueRenderOption.FORMATTED_VALUE.
        valueRenderOption: 'FORMATTED_VALUE',

        auth: credentials.installed.api_key
    };

    return new Promise((resolve, reject) => {
        sheets.spreadsheets.values.get(request, function(err, response) {
            if (err) {
                reject(err);
            }
            resolve(response);
        });
    });
}

exports.getDomains = getDomains;
