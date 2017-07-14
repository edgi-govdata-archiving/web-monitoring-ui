'use strict';

const express = require('express');
const app = express();
const path = require('path');
const sheetData = require('./sheet-data');
const config = require('./configuration');

const serverPort = process.env.PORT || 3001;

app.set('views', path.join(__dirname, '../views'));
app.use(express.static('dist'));
app.engine('html', require('ejs').renderFile);

const filterArray = [
    'WEB_MONITORING_DB_URL'
];

app.get('/api/domains/:username', function(request, response) {
    const username = request.params.username;

    sheetData.getDomains(username)
        .then(data => response.json(data))
        .catch(error => response.status(500).json(error));
});

app.get('/api/timeframe', function(request, response) {
    const date = request.query.date && new Date(request.query.date);
    sheetData.getCurrentTimeframe(date)
        .then(data => response.json(data))
        .catch(error => response.status(500).json(error));
});

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
