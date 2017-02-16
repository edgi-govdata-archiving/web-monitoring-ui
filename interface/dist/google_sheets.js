$(document).ready(function () {
  // 1. Load the JavaScript client library.
  gapi.load('client', start);

  function start() {
    $.getJSON('config.json', function (data) {
      var API_KEY = data.api_key;
      // 2. Initialize the JavaScript client library.
      gapi.client.init({
        'apiKey': API_KEY
      });
      showPage(8)
    });
  };

  function showPage(row_index) {
    // link to test spreadsheet: https://docs.google.com/spreadsheets/d/17QA_C2-XhLefxZlRKw74KDY3VNstbPvK3IHWluDJMGQ/edit#gid=0
    var sheetID = '17QA_C2-XhLefxZlRKw74KDY3VNstbPvK3IHWluDJMGQ'
    var range = `A${row_index}:N${row_index}`

    // Info on spreadsheets.values.get: https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/get
    var path = `https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/${range}`;

    gapi.client.request({
      'path': path,
    }).then(function (response) {
      // If we need to write to spreadsheets: 
      // 1) Get started: https://developers.google.com/sheets/api/quickstart/js
      // 2) Read/write docs: https://developers.google.com/sheets/api/guides/values


      
      var values = response.result.values;
      console.log(values)
      if (values.length > 0) {
        appendPre('Data, data:');
        for (i = 0; i < values.length; i++) {
          var row = values[i];
          // Print columns A and E, which correspond to indices 0 and 4.
          appendPre(row[0] + ', ' + row[4]);
        }
        // Pagefreezer_1.Pagefreezer.diffPages(row[8], row[9], 
        //   function (data, status) {
        //       console.log(data);
        //       $('#pageView').html(data.result.output.html);
        // });

      } else {
        appendPre('No data found.');
      }
    }, function (response) {
      appendPre('Error: ' + response.result.error.message);
    });
  }


  function appendPre(message) {
    var pre = document.getElementById('content');
    var textContent = document.createTextNode(message + '\n');
    pre.appendChild(textContent);
  }
})

