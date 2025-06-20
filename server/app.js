'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const path = require('path');
const sheetData = require('./sheet-data');
const config = require('./configuration');

const serverPort = process.env.PORT || 3001;

/**
 * Create a generic error handler for a response. This (or something similar)
 * should always conclude a promise chain in an HTTP request handler. If you
 * have an error you expect, however (e.g. some kind of specialized "not found"
 * error), you should handle it directly so you can send a useful message.
 *
 * @param {Express.Response} response
 */
function createErrorHandler (response) {
  return error => {
    let errorData = error;
    if (error instanceof Error) {
      if (config.baseConfiguration().NODE_ENV !== 'production') {
        errorData = { error: error.message, stack: error.stack };
      }
      else {
        errorData = { error: 'An unknown error ocurred.' };
      }
    }
    response.status(error.status || 500).json(errorData);
  };
}

// If FORCE_SSL is true, redirect any non-SSL requests to https.
if (process.env.FORCE_SSL && process.env.FORCE_SSL.toLowerCase() === 'true') {
  // The /healthcheck route is exempted, to allow liveness/readiness probes
  // to make requests internal to a deployment (inside SSL termination).
  const exemptPaths = /^\/healthcheck\/?$/;

  app.use((request, response, next) => {
    if (request.secure || request.headers['x-forwarded-proto'] === 'https' || exemptPaths.test(request.path)) {
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
  app.use(webpackDevMiddleware(webpack(webpackConfig)));
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

app.get('/healthcheck', function (request, response) {
  response.json({});
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
    return response.status(401).json({ error: 'You must include authorization headers' });
  }

  let host = config.baseConfiguration().WEB_MONITORING_DB_URL;
  if (!host.endsWith('/')) {
    host += '/';
  }

  fetch(`${host}users/session`, {
    headers: { Authorization: request.headers.authorization },
  })
    .then(authResponse => {
      return authResponse.text().then(body => ({ authResponse, body }));
    })
    .then(({ authResponse, body }) => {
      if (authResponse.status !== 200) {
        return response.status(authResponse.status).end(body);
      }
      next();
    })
    .catch(error => {
      console.error(error);
      return response.status(500).json({ error: 'Authentication Error' });
    });
}

app.post(
  '/api/importantchange',
  authorizeRequest,
  validateChangeBody,
  function (request, response) {
    sheetData.addChangeToImportant(request.body)
      .then(data => response.json(data))
      .catch(createErrorHandler(response));
  }
);

app.post(
  '/api/dictionary',
  authorizeRequest,
  validateChangeBody,
  function (request, response) {
    sheetData.addChangeToDictionary(request.body)
      .then(data => response.json(data))
      .catch(createErrorHandler(response));
  }
);

/**
 * Main view for manual entry
 */
app.get('/{*splat}', function (request, response) {
  const useGzip = config.baseConfiguration().NODE_ENV === 'production'
    && request.acceptsEncodings('gzip');

  response.render('main.html', {
    configuration: config.clientConfiguration(),
    useGzip
  });
});

app.listen(serverPort, function (error) {
  if (error) throw error;

  console.log(`Listening on port ${serverPort}`);
});
