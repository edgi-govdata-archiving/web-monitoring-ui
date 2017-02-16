/*
 * Copyright (c) 2017 Allan Pichardo.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {Pagefreezer} from "./Pagefreezer";
// import * as gapi from "gapi";

$( document ).ready(function() {
    console.log("ready");
    toggleProgressbar(false);

    $('#submitButton').click(function () {
        toggleProgressbar(true);
        Pagefreezer.diffPages(
            $('#url1').val(),
            $('#url2').val(),
            function(data, status) {
                $('#pageView').html(data.result.output.html);
                $('#pageView link[rel=stylesheet]').remove();
                toggleProgressbar(false);
            });
    });
    gapi.load('client', start);

    function start() {
        $.getJSON('config.json', function (data) {
        var API_KEY = data.api_key;
        // 2. Initialize the JavaScript client library.
        // !! Work around because gapi.client.init is not in types file 
        (gapi as any).client.init({
            'apiKey': API_KEY
        });
        showPage(8)
        });
    };

    function showPage(row_index: number) {
        // link to test spreadsheet: https://docs.google.com/spreadsheets/d/17QA_C2-XhLefxZlRKw74KDY3VNstbPvK3IHWluDJMGQ/edit#gid=0
        var sheetID = '17QA_C2-XhLefxZlRKw74KDY3VNstbPvK3IHWluDJMGQ'
        var range = `A${row_index}:N${row_index}`

        // Info on spreadsheets.values.get: https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/get
        var path = `https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/${range}`;

        gapi.client.request({
        'path': path,
        }).then(function (response: any) {
        // If we need to write to spreadsheets: 
        // 1) Get started: https://developers.google.com/sheets/api/quickstart/js
        // 2) Read/write docs: https://developers.google.com/sheets/api/guides/values

        var values = response.result.values;
        console.log(values)
        if (values.length > 0) {
            appendPre('Data, data:');
            for (let i = 0; i < values.length; i++) {
                let row = values[i];
                // Print columns A and E, which correspond to indices 0 and 4.
                appendPre(row[0] + ', ' + row[4]);

                console.log(row[8] + ' ' + row[9])
                toggleProgressbar(true);
                Pagefreezer.diffPages(
                    $('#url1').val(),
                    $('#url2').val(),
                    function(data, status) {
                        $('#pageView').html(data.result.output.html);
                        $('#pageView link[rel=stylesheet]').remove();
                        toggleProgressbar(false);
                    });
            }
            

        } else {
            appendPre('No data found.');
        }
        }, function (response: any) {
        appendPre('Error: ' + response.result.error.message);
        });
    }


    function appendPre(message: string) {
        var pre = document.getElementById('content');
        var textContent = document.createTextNode(message + '\n');
        pre.appendChild(textContent);
    }
})

function toggleProgressbar(isVisible: boolean) {
    if(isVisible) {
        $('.progress').show()
    } else {
        $('.progress').hide()
    }
}
