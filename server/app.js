'use strict';

const express = require('express');
const app = express();
const path = require('path');
const sheetData = require('./sheet-data');
const config = require('./configuration');

const serverPort = process.env.PORT || 3001;
const filterArray = [
    'WEB_MONITORING_DB_URL'
];

if (process.env.FORCE_SSL && process.env.FORCE_SSL.toLowerCase() === 'true') {
    app.use((request, response, next) => {
        if (request.secure || request.headers['x-forwarded-proto'] === 'https') {
            return next();
        }
        response.redirect(
            301,
            `https://${request.headers.host}${request.originalUrl}`
        );
    });
}

app.set('views', path.join(__dirname, '../views'));
app.use(express.static('dist'));
app.engine('html', require('ejs').renderFile);

app.get('/api/domains/:username', function(request, response) {
    const username = request.params.username;

    sheetData.getDomains(username)
        .then(data => response.json(data))
        .catch(error => response
            .status(error.status || 500)
            .json(error));
});

app.get('/api/timeframe', function(request, response) {
    const date = request.query.date && new Date(request.query.date);
    sheetData.getCurrentTimeframe(date)
        .then(data => response.json(data))
        .catch(error => response.status(500).json(error));
});

// TODO: Remove these test routes.
app.get('/api/importantchange', function(request, response) {
    const configuration = config.baseConfiguration();
    const values = [0, 'hello', 'world'];
    const message = sheetData.appendRowGoogleSheet(values, configuration.GOOGLE_IMPORTANT_CHANGE_SHEET_ID, configuration)
    message.then(data => response.json(data)).catch(data => response.json(data));
})

app.get('/api/dictionary', function(request, response) {
    const configuration = config.baseConfiguration();
    const values = [0, 'dictionary', 'changes'];
    const message = sheetData.appendRowGoogleSheet(values, configuration.GOOGLE_DICTIONARY_SHEET_ID, configuration)
    message.then(data => response.json(data)).catch(data => response.json(data));
})

/**
 * Main view for manual entry
 */
app.get('*', function (request, response) {
    response.render('main.html', {
        configuration: config.filterConfiguration(filterArray)
    });
});

app.listen(serverPort, function () {
    console.log(`Listening on port ${serverPort}`);
});
