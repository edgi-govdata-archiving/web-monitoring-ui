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

    $('#toggle_view').click(toggleView);

    // Load Google api
    gapi.load('client', start);

    setPagination()
})

function setPagination() {
    var urlParams = new URLSearchParams(window.location.search);
    var index = parseInt(urlParams.get('index')) || 7;
    $('#prev_index').text(`<-- Row ${index-1}`).attr('href', `/diffbyindex?index=${index-1}`);
    $('#next_index').text(`Row ${index+1} -->`).attr('href', `/diffbyindex?index=${index+1}`);
}

function start() {
    $.getJSON('config.json', function (data) {
        var API_KEY = data.api_key;
        // 2. Initialize the JavaScript client library.
        // !! Work around because gapi.client.init is not in types file 
        (gapi as any).client.init({ 'apiKey': API_KEY });

        $('#diff_by_index').click(function () {
            var urlParams = new URLSearchParams(window.location.search);
            var index = parseInt(urlParams.get('index'));
            showPage(index);
        })
    });
};

function showPage(row_index: number) {
    // link to test spreadsheet: https://docs.google.com/spreadsheets/d/17QA_C2-XhLefxZlRKw74KDY3VNstbPvK3IHWluDJMGQ/edit#gid=0
    var sheetID = '17QA_C2-XhLefxZlRKw74KDY3VNstbPvK3IHWluDJMGQ'
    var range = `A${row_index}:AG${row_index}`

    // Info on spreadsheets.values.get: https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/get
    var path = `https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/${range}`;
    gapi.client.request({
        'path': path,
    }).then(function (response: any) {
        // If we need to write to spreadsheets: 
        // 1) Get started: https://developers.google.com/sheets/api/quickstart/js
        // 2) Read/write docs: https://developers.google.com/sheets/api/guides/values

        var values = response.result.values;
        if (values) {
            var row_data = values[0];
            var old_url = row_data[8];
            var new_url = row_data[9];

            console.log(row_data);
            showDiffMetadata(row_data);
            // runDiff(old_url, new_url);
            
        } else {
            $('#diff_title').text('No data found')
        }
    }, function (response: any) {
        console.error('Error: ' + response.result.error.message);
    });
}

function runDiff(old_url: string, new_url: string) {
    // Todo: turn into own function
    toggleProgressbar(true);
    Pagefreezer.diffPages(
        old_url,
        new_url,
        function(data, status) {
            loadIframe(data.result.output.html);
            toggleProgressbar(false);
    });
}
function loadIframe(html_embed: string) {
    // inject html
    var iframe = document.getElementById('pageView');
    iframe.setAttribute('srcdoc', html_embed);

    iframe.onload = function() {
        // inject diff css
        var frm = (frames as any)['pageView'].contentDocument;
        var otherhead = frm.getElementsByTagName("head")[0];
        var link = frm.createElement("link");
        link.setAttribute("rel", "stylesheet");
        link.setAttribute("type", "text/css");
        link.setAttribute("href", "http://localhost:3000/css/diff.css");
        otherhead.appendChild(link);

        // set dimensions
        // iframe.setAttribute('width', (iframe as any).contentWindow.document.body.scrollWidth);
        iframe.setAttribute('height',(iframe as any).contentWindow.document.body.scrollHeight);
    };
}

function showDiffMetadata(data: any) {
    var index = data[0] || 'No index';
    var title = data[5] || 'No title';
    var url = data[6] || 'No url'
    $('#diff_title').text(`${index} - ${title} : `)
    $('#diff_page_url').attr('href', `http://${url}`).text(url)

    // Magic numbers! Match with column indexes from google spreadsheet.
    // Hack because we don't get any type of metadata, just an array
    for (var i = 15; i <= 32; i++) {
        $(`#cbox${i}`).prop('checked', data[i])
    }
}

function toggleProgressbar(isVisible: boolean) {
    if(isVisible) {
        $('.progress').show()
    } else {
        $('.progress').hide()
    }
}

function toggleView(e: Event) {
    e.preventDefault();
    $('.info-text').toggle();
    $('#inspectorView').toggleClass('short-view');
}

// Quick type for URLSearchParams 
declare class URLSearchParams {
    /** Constructor returning a URLSearchParams object. */
    constructor(init?: string| URLSearchParams);

    /** Returns the first value associated to the given search parameter. */
    get(name: string): string;
}
