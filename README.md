[![Code of Conduct](https://img.shields.io/badge/%E2%9D%A4-code%20of%20conduct-blue.svg?style=flat)](https://github.com/edgi-govdata-archiving/overview/blob/master/CONDUCT.md)

# web-monitoring-ui

This repository is part of the EDGI [Web Monitoring Project](https://github.com/edgi-govdata-archiving/web-monitoring).

This component works with [web-monitoring-db](https://github.com/edgi-govdata-archiving/web-monitoring-db) and [web-monitoring-processing](https://github.com/edgi-govdata-archiving/web-monitoring-processing) to support the next web monitoring workflow.

It’s a React.js-based browser application with a Node.js backend with the following capabilities:
* Consume subset of data from web-monitoring-db as proof of concept, read/write annotations
    * [DEMO](https://monitoring-staging.envirodatagov.org)
    * LIST VIEW shows first page of records from [web-monitor-db](https://api-staging.monitoring.envirdatagov.org/api/v0/pages) JSON endpoint
    * PAGE VIEW shows basic info about the latest version of that page: site, URLs and links to Wayback Machine calendar view and page versions
        * updates annotations


## Installation

1. Install Node v10.15.3
    - We recommend [installing Node Version Manager][nvm-install], then: `nvm install 10.15.3`
    - If you are using Windows, check out [Nodenv][nodenv] or any of [these alternatives][nvm-alternatives].

2. Install node dependencies with `npm`

    ```sh
    npm install
    ```

3. Copy `.env.example` to `.env` and supply any local configuration info you need (all fields are optional)

4. Start the web server

    ```sh
    npm start
    ```

5. (Optional) Set up Google Sheets for saving important changes and repeated, “dictionary” changes. See the section below on [Google Sheets](#google-sheets-tasking-and-significant-changes).

[nodenv]: https://github.com/nodenv/nodenv
[nvm-alternatives]: https://github.com/nodenv/nodenv/wiki/Alternatives
[nvm-install]: https://github.com/creationix/nvm#install-script


## Running tests

To run all tests once

```sh
npm test
```

while to start the test runner in watch mode

```sh
npm run test-watch
```


## Manual view
Access the main view at `http://localhost:3001`

Screenshot:
![screenshot](screenshot.png)


## Google Sheets (Significant Changes)

The analysis UI keeps some data and runtime configuration separate from the public web monitoring database ([`web-monitoring-db`](http://github.com/edgi-govdata-archiving/web-monitoring-db)). This data is kept in 3 Google Docs spreadsheets. You can use the UI without configuring them, but you will be missing some functionality.

First, you’ll need to create a *service account* the application can use to access the sheets. To do so, follow the first half of [this tutorial](http://isd-soft.com/tech_blog/accessing-google-apis-using-service-account-node-js/). During the process, you should have downloaded a `.json` file with authentication information. Add the `client_email` and `private_key` fields from the file to your `.env` file:

```sh
GOOGLE_SERVICE_CLIENT_EMAIL=73874number-example@developer.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\EXAMPLEExampleG9w0BAQEFAASCBKkwggSlAgEAAoIBAQCsBjS7qpN+vUhz\nXRhcL3pwKZtewjZ478rs7FylT+YAJMmy1wOS3ze2FVYaBHelloFromXm9gL82OCSJn1ZThePastuwGA0\npe9oZSAtiB4ujaHhcWCO7ZYZzBvsPRJZR2eo4UokDpmgAS9ExTU7zN+eKTBTFGB4\nKDc7FAxqhk9dBcYFpLU34wuQsS/SZY1j3I/pmqQ7CHnGG+KLhyRiZ6UvlT8KjWejWTFdfMoredksjfGibberishkljfkls+\nkerGibberishll7\n7oU0VVs3xY5nhkjd#r34jkd7vxjknfy3jsdhf5zjkGYfyXFNhVjsl/bJ3AHA/C9Fd5z9JmOCsZE\nyD9Yjy72C50CjOgCp568pse85A==\n-----END PRIVATE KEY-----\n
```

In the next two sections, you’ll create the 2 sheets.

**The `Timeframes` sheet** holds information about analysis timeframes. The analysis team currently works on changes in 3-day chunks and this sheet lets you define when those chunks start and end. It should have exactly two columns. The first is a date (in ISO 8601 format) that a timeframe starts on. The second is the duration of that timeframe in seconds (e.g. `259200` for 3 days). Timeframes are assumed to repeat until a new timeframe is started. Like `tasks`, the first row is reserved for column headers. This sheet might look like:

| A | B | C |
| - | - | - |
| Start Time           | Duration (seconds) | Comments |
| 2017-01-20T04:00:00Z | 259200             |          |
| 2017-04-20T04:00:00Z | 604800             | Take a breather for a few days and change to a 7-day period |
| 2017-01-27T04:00:00Z | 259200             | Back to normal! |

In this example, analysis started going in 3-day chunks from January through April 20th, but then switched to 7 days for a week, then back to 3-day chunks again.

Finally, share the spreadsheet with the e-mail address of the service account you created earlier.

Once you have the sheets created, update your `.env` file with ID of the sheet:

```sh
# ID of the Google Sheet we created above. For more on how to get the ID, see:
# https://developers.google.com/sheets/api/guides/concepts#spreadsheet_id
GOOGLE_TASK_SHEET_ID=AIzaSyAChRujfXXXXXXXXMP5eouRRQ6bxV-1u_o
```


### Important Changes and Dictionary Sheets

Two Google Docs spreadsheets are used to keep track of changes that users mark as “important” or add to the “dictionary” of repeated, common changes. This information also gets saved to the database, but since analysts’ current workflow is spreadsheet-based, we *also* send this data to the spreadsheets. To get this working:

1) Make copies of these spreadsheets:

    * [Important Changes](https://docs.google.com/spreadsheets/d/1S2mZKuV2v7-uec2eGA0zp3X1v1IAnoCHkLXmL-ChqnM/edit#gid=1804226491)
    * [Dictionary](https://docs.google.com/spreadsheets/d/1YRo1uNRRX92eSo2JiGEu50TpPVXYaLchrUVOZ3UW0Bs/edit#gid=554811086)

    Make note the of [sheet IDs](https://developers.google.com/sheets/api/guides/concepts#spreadsheet_id) of your new spreadsheets.

2) Share each of those sheets with the e-mail address of the service account you created earlier. You must give it **write** access.

3) Update your `.env` file with the IDs of the sheets:

```sh
GOOGLE_IMPORTANT_CHANGE_SHEET_ID=examplesdf8Za7sdft39a_osnzhJBI2dsftasdf
GOOGLE_DICTIONARY_SHEET_ID=examplesdf8Za7sdft39a_osnzhJBI2dsftasdf
```

Restart your app server and try clicking on the “add important change” or “add to dictionary” buttons. A new line should be added to the relevant sheet.

## Code of Conduct

This repository falls under EDGI's [Code of Conduct](https://github.com/edgi-govdata-archiving/overview/blob/master/CONDUCT.md).

## Getting Involved

We need your help! Please read through the [Web Monitoring Project](https://github.com/edgi-govdata-archiving/web-monitoring) project document and see what you can help with and check [EDGI’s contribution guidelines](https://github.com/edgi-govdata-archiving/overview/blob/master/CONTRIBUTING.md) for information on how to propose issues or changes.


## Docker

You can also run this project via Docker. To build and run (on port 3001, as in the instructions for running directly above):

```
docker build -t envirodgi/ui .
docker run -p 3001:3001 -e <ENVIRONMENT VARIABLES> envirodgi/ui
```

Point your browser to ``http://localhost:3001``.

To run tests via Docker:

```
docker build -t envirodgi/ui:dev --target dev .
docker run envirodgi/ui:dev npm run test
```


## Contributors

This project wouldn’t exist without a lot of amazing people’s help. Thanks to the following for all their contributions!

<!-- ALL-CONTRIBUTORS-LIST:START -->
| Contributions | Name |
| ----: | :---- |
| [📖](# "Documentation") [📋](# "Organizer") [💬](# "Answering Questions") [👀](# "Reviewer") | [Dan Allan](https://github.com/danielballan) |
| [💡](# "Examples") | [@allanpichardo](https://github.com/allanpichardo) |
| [💡](# "Examples") | [@ArcTanSusan](https://github.com/ArcTanSusan) |
| [💡](# "Examples") | [@AutumnColeman](https://github.com/AutumnColeman) |
| [📋](# "Organizer") [🔍](# "Funding/Grant Finder") | [Andrew Bergman](https://github.com/ambergman) |
| [💻](# "Code") [📖](# "Documentation") [💬](# "Answering Questions") [👀](# "Reviewer") | [Rob Brackett](https://github.com/Mr0grog) |
| [📖](# "Documentation") | [Patrick Connolly](https://github.com/patcon) |
| [📖](# "Documentation") | [Manaswini Das](https://github.com/manaswinidas) |
| [💡](# "Examples") | [@lh00000000](https://github.com/lh00000000) |
| [💻](# "Code") [🎨](# "Design") [📖](# "Documentation") [💬](# "Answering Questions") [👀](# "Reviewer") | [Kevin Nguyen](https://github.com/lightandluck) |
| [📖](# "Documentation") [📋](# "Organizer") [📢](# "Talks") | [Matt Price](https://github.com/titaniumbones) |
| [📋](# "Organizer") [🔍](# "Funding/Grant Finder") | [Toly Rinberg](https://github.com/trinberg) |
| [💻](# "Code") | [Ben Sheldon](https://github.com/bensheldon) |
| [💡](# "Examples") | [@StephenAlanBuckley](https://github.com/StephenAlanBuckley) |
| [💡](# "Examples") | [@stuartlynn](https://github.com/stuartlynn) |
| [💻](# "Code") | [Michelle Truong](https://github.com/fendatr) |
| [📖](# "Documentation") [📋](# "Organizer") | [Dawn Walker](https://github.com/dcwalk) |
| [💻](# "Code") [📖](# "Documentation") [⚠️](# "Tests") | [Sarah Yu](https://github.com/SYU15) |
| [💻](# "Code") [⚠️](# "Tests") | [Alberto Zaccagni](https://github.com/lazywithclass) |

<!-- ALL-CONTRIBUTORS-LIST:END -->

(For a key to the contribution emoji or more info on this format, check out [“All Contributors.”](https://github.com/kentcdodds/all-contributors))


## License & Copyright

Copyright (C) <2017> Environmental Data and Governance Initiative (EDGI)
This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, version 3.0.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

See the [`LICENSE`](https://github.com/edgi-govdata-archiving/web-monitoring-ui/blob/master/LICENSE) file for details.
