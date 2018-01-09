'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const makeRequest = require('request');
const app = express();
const path = require('path');
const sheetData = require('./sheet-data');
const config = require('./configuration');

const serverPort = process.env.PORT || 3001;

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

// Serve assets (live from Webpack in dev mode)
if (config.baseConfiguration().NODE_ENV === 'development') {
  const webpack = require('webpack');
  const webpackDevMiddleware = require('webpack-dev-middleware');
  const webpackConfig = require('../webpack.config.js');

  app.use(webpackDevMiddleware(webpack(webpackConfig), {
    publicPath: webpackConfig.output.publicPath
  }));
}
else {
  app.use(express.static('dist', {
    setHeaders (response, filePath, stat) {
      if (filePath.endsWith('.gz')) {
        response.set('Content-Encoding', 'gzip');

        const preExtension = (filePath.match(/\.([^/]+)\.gz$/i) || ['', ''])[1];
        const contentType = {
          js: 'application/javascript',
          css: 'text/css',
          svg: 'image/svg+xml'
        }[preExtension];

        if (contentType) {
          response.set('Content-Type', contentType);
        }
      }
    }
  }));
}

app.set('views', path.join(__dirname, '../views'));
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

function authorizeRequest (request, response, next) {
  if (!request.headers.authorization) {
    return response.status(401).json({error: 'You must include authorization headers'});
  }

  let host = config.baseConfiguration().WEB_MONITORING_DB_URL;
  if (!host.endsWith('/')) {
    host += '/';
  }

  makeRequest({
    url: `${host}users/session`,
    headers: {Authorization: request.headers.authorization},
    callback (error, authResponse, body) {
      if (error) {
        console.error(error);
        return response.status(500).json({error: 'Authentication Error'});
      }
      else if (authResponse.statusCode !== 200) {
        return response.status(authResponse.statusCode).end(body);
      }
      next();
    }
  });
}

app.post(
  '/api/importantchange',
  authorizeRequest,
  validateChangeBody,
  function(request, response) {
    sheetData.addChangeToImportant(request.body)
      .then(data => response.json(data))
      .catch(error => response.status(500).json(error));
  }
);

app.post(
  '/api/dictionary',
  authorizeRequest,
  validateChangeBody,
  function(request, response) {
    sheetData.addChangeToDictionary(request.body)
      .then(data => response.json(data))
      .catch(error => response.status(500).json(error));
  }
);

/**
 * Main view for manual entry
 */
app.get('*', function (request, response) {
  const useGzip = config.baseConfiguration().NODE_ENV === 'production'
    && request.acceptsEncodings('gzip');

  response.render('main.html', {
    configuration: config.clientConfiguration(),
    useGzip
  });
});

app.listen(serverPort, function () {
  console.log(`Listening on port ${serverPort}`);
});
