'use strict';

const express = require('express');
const app = express();
const gapi = require('./domains');

app.set('views', __dirname + '/views');
app.use(express.static('dist'));
app.engine('html', require('ejs').renderFile);

let baseEnvironment;
const config = clientConfiguration();

/**
 * Main view for manual entry
 */
app.get('/', function (req, res) {
    res.render('main.html', {
        configuration: config
    });
});

// TODO: Remove - Temporary route to test loggedIn state
app.get('/:username', function (req, res) {
    let username = req.params.username;
    res.render('main.html', {
        configuration: config,
        loggedIn: username
    });
});

app.get('/domains/:username', function(req, res) {
    let username = req.params.username;
    let domains = gapi.getDomains(username, config);

    domains
    .then(data => {
        res.json(data);
    })
    .catch(err => {
        res.json(err);
    })
});

app.listen(process.env.PORT || 3000, function () {
    console.log('Listening on port 3000');
});


/**
 * Create a configuration object suitable for passing to the client by taking
 * an allow-listed set of keys from process.env.
 * In development, also read from a file named .env, if present.
 * @returns {Object}
 */
function clientConfiguration () {
    baseEnvironment = baseEnvironment || Object.assign({}, process.env);

    let source = baseEnvironment;
    if (process.env.NODE_ENV !== 'production') {
        const fromFile = require('dotenv').config();
        // If there is no .env file, don't throw and just use process.env
        if (fromFile.error && fromFile.error.code !== 'ENOENT') {
            throw fromFile.error;
        }
        // process.env will have been
        source = Object.assign(fromFile.parsed || {}, baseEnvironment);
    }

    // TODO: Create different config for credentials so they don't show up in main.html
    const allowedFields = [
        'WEB_MONITORING_DB_URL',
        'WEB_MONITORING_DB_USER',
        'WEB_MONITORING_DB_PASSWORD',
        'TASK_SHEET_ID',
        'API_KEY'
    ];

    return allowedFields.reduce((result, field) => {
        result[field] = source[field];
        return result;
    }, {});
}
