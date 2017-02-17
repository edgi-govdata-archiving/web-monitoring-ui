A node application with the following capabilities:
* Page through records from Google spreadsheet and visualizes differences between URLs using pagefreezer cli
    * DEMO is READ-ONLY
    * app pulls data from this example: https://docs.google.com/spreadsheets/d/17QA_C2-XhLefxZlRKw74KDY3VNstbPvK3IHWluDJMGQ/edit#gid=0
    * sheet mimics data that analysts use but added fields for urls seeded from these examples: https://github.com/edgi-govdata-archiving/pagefreezer-cli/tree/master/archives

* These functions still available but hidden:
    * Take 2 URLs as input and visualize their differences
    * Take a formatted URL and return raw JSON from pagefreezer
    * Take a formatted URL and automatically display a diff

#####Usage:
Checkout branch with `git checkout ui_mockup`, 
install the node dependencies with `npm install`, 
create `config.json` with google api_key,
then run `node app.js`

How to get api key: https://developers.google.com/api-client-library/javascript/start/start-js

######Manual view:
access the main view at `http://localhost:3000`

Screenshot:
![screenshot](screenshot.png)

######URL Schemes:
The new interface routes to:
`http://localhost:3000/diffbyindex`

With parameters:
`index` (required)

Main page `http://localhost:3000` redirects to  
`http://localhost:3000/diffbyindex?index=7` as first record

The old interface is hidden, but GET requests can still be made to:
`http://localhost:3000/diff`

With parameters:
`old_url` (required),
`new_url` (required),
`as` (optional can be `json` or `view`)

######Example:
<http://localhost:3000/diff?old_url=https://raw.githubusercontent.com/edgi-govdata-archiving/pagefreezer-cli/master/archives/truepos-major-changes-a.html&new_url=https://raw.githubusercontent.com/edgi-govdata-archiving/pagefreezer-cli/master/archives/truepos-major-changes-b.html&as=view>
Automatically runs the diff and displays the output
