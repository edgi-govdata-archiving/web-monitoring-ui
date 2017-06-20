'use strict';

const express = require('express');
const app = express();
const path = require('path');
const gapi = require('./domains');
const config = require('./configuration');

app.set('views', path.join(__dirname, '../views'));
app.use(express.static('dist'));
app.engine('html', require('ejs').renderFile);

// TODO: Remove - Temporary route to test loggedIn state
app.get('/loggedIn/:username', function (request, response) {
    let username = request.params.username;
    response.render('main.html', {
        configuration: config.clientConfiguration(),
        loggedIn: username
    });
});

app.get('/api/domains/:username', function(request, response) {
    let username = request.params.username;
    let domains = gapi.getDomains(username);

    domains
    .then(data => {
        response.json(data);
    })
    .catch(error => {
        response.json(error);
    })
});

/**
 * Main view for manual entry
 */
app.get('*', function (request, response) {
    response.render('main.html', {
        configuration: config.clientConfiguration()
    });
});

app.listen(process.env.PORT || 3000, function () {
    console.log('Listening on port 3000');
});
