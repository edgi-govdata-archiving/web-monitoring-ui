/*
 * Copyright (c) 2017 Allan Pichardo.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
'use strict';

const express = require('express');
const app = express();

app.set('views', __dirname + '/views');
app.use(express.static('dist'));
app.engine('html', require('ejs').renderFile);

/**
 * Main view for manual entry
 */
app.get('*', function (req, res) {
    res.render('main.html', {
        configuration: clientConfiguration()
    });
});

app.listen(process.env.PORT || 3000, function () {
    console.log('Listening on port 3000');
});


let baseEnvironment;

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

    const allowedFields = [
        'WEB_MONITORING_DB_URL',
        'WEB_MONITORING_DB_USER',
        'WEB_MONITORING_DB_PASSWORD'
    ];

    return allowedFields.reduce((result, field) => {
        result[field] = source[field];
        return result;
    }, {});
}
