'use strict';

const express = require('express');
const bodyParser = require('body-parser');
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
app.use(bodyParser.json());

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

function validateChangeBody (request, response, next) {
  const valid = request.body
    && request.body.page
    && request.body.from_version
    && request.body.to_version
    && request.body.annotation
    && request.body.user;
  if (!valid) {
    return response.status(400).json({
      error: 'You must POST a JSON object with: {page: Object, from_version: Object, to_version: Object, annotation: Object, user: String}'
    });
  }
  next();
}

app.post('/api/importantchange', validateChangeBody, function(request, response) {
  sheetData.addChangeToImportant(request.body)
    .then(data => response.json(data))
    .catch(error => response.status(500).json(error));
});

app.post('/api/dictionary', validateChangeBody, function(request, response) {
  sheetData.addChangeToDictionary(request.body)
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
