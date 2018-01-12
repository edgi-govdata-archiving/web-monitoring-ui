# web-monitoring-ui

This repository is part of the EDGI [Web Monitoring Project](https://github.com/edgi-govdata-archiving/web-monitoring).

This component works with [web-monitoring-db](https://github.com/edgi-govdata-archiving/web-monitoring-db) and [web-monitoring-processing](https://github.com/edgi-govdata-archiving/web-monitoring-processing) to support the next web monitoring workflow.

It’s a React.js-based browser application with a Node.js backend with the following capabilities:
* Consume subset of data from web-monitoring-db as proof of concept, read/write annotations
    * [DEMO](https://monitoring-staging.envirodatagov.org)
    * LIST VIEW shows first page of records from [web-monitor-db](https://api-staging.monitoring.envirdatagov.org/api/v0/pages) JSON endpoint
    * PAGE VIEW shows basic info about the latest version of that page: site, urls, and links to Versionista diffs
        * updates annotations


## Installation

1. Ensure you have yarn ([installation instructions](https://yarnpkg.com/en/docs/install))
2. Clone this repo
3. Install node dependencies with `yarn`

    ```sh
    yarn install
    ```
    
    *Note: you might need Python 2 in order to build & install `node-zopfli`, one of our dependencies. If you are also running [`web-monitoring-processing`](https://github.com/edgi-govdata-archiving/web-monitoring-processing) (which uses Python 3), tools like [Conda](https://conda.io/) or [Pyenv](https://github.com/pyenv/pyenv) can help you manage multiple versions of Python.*

4. Copy `.env.example` to `.env` and supply any local configuration info you need (all fields are optional)

5. Start the web server

    ```sh
    yarn run start
    ```

6. (Optional) Set up Google Sheets for user tasking, saving important changes and repeated, “dictionary” changes. If you skip this step, everything will work fine, but your UI will show all pages when logged in, not just your assigned pages. See the section below on [Google Sheets](#google-sheets-tasking-and-significant-changes).

## Running tests

To run all tests once

```sh
yarn test
```

while to start the test runner in watch mode

```sh
yarn run test-watch
```

## Manual view
Access the main view at `http://localhost:3001`

Screenshot:
![screenshot](screenshot.png)


## Google Sheets (Tasking and Significant Changes)

The analysis UI keeps some data and runtime configuration separate from the public web monitoring database ([`web-monitoring-db`](http://github.com/edgi-govdata-archiving/web-monitoring-db)). This data is kept in 3 Google Docs spreadsheets. You can use the UI without configuring them, but you will be missing some functionality.

First, you’ll need to create a *service account* the application can use to access the sheets. To do so, follow the first half of [this tutorial](http://isd-soft.com/tech_blog/accessing-google-apis-using-service-account-node-js/). During the process, you should have downloaded a `.json` file with authentication information. Add the `client_email` and `private_key` fields from the file to you `.env` file:

```sh
GOOGLE_SERVICE_CLIENT_EMAIL=73874number-example@developer.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\EXAMPLEExampleG9w0BAQEFAASCBKkwggSlAgEAAoIBAQCsBjS7qpN+vUhz\nXRhcL3pwKZtewjZ478rs7FylT+YAJMmy1wOS3ze2FVYaBHelloFromXm9gL82OCSJn1ZThePastuwGA0\npe9oZSAtiB4ujaHhcWCO7ZYZzBvsPRJZR2eo4UokDpmgAS9ExTU7zN+eKTBTFGB4\nKDc7FAxqhk9dBcYFpLU34wuQsS/SZY1j3I/pmqQ7CHnGG+KLhyRiZ6UvlT8KjWejWTFdfMoredksjfGibberishkljfkls+\nkerGibberishll7\n7oU0VVs3xY5nhkjd#r34jkd7vxjknfy3jsdhf5zjkGYfyXFNhVjsl/bJ3AHA/C9Fd5z9JmOCsZE\nyD9Yjy72C50CjOgCp568pse85A==\n-----END PRIVATE KEY-----\n
```

In the next two sections, you’ll create the 3 sheets.


### Creating Tasking Sheets

User tasking data (analysis timeframes, who is assigned what domains and pages, etc.) is currently kept in a Google Docs spreadsheet for easy manipulation by project admins. To enable tasking in your local build, you’ll need to create your own copy of this spreadsheet.

You can start off by making a copy of [this example tasking sheet](https://docs.google.com/spreadsheets/d/1l5TAoJBbX6xV7ZYF9g5TnryJ4-SsatXvb-6cWuTMW5A/). Otherwise, you can create one from scratch: create a spreadsheet in Google Docs. It should have two worksheets or tabs, named:

1. `Tasks` (this should be the first tab)
2. `Timeframes`

**The `Tasks` sheet** should be formatted such that the first column is a list of usernames/e-mail addresses. The rest of the columns in that row are the names of domains that the user in the first column is assigned (one domain per column). Domains are the `site` attribute of a page in [the API](https://api.monitoring.envirodatagov.org). The first row is reserved for column headers. The sheet might look like:

| A | B | C |
| - | - | - |
| User/e-mail              | Site                | Site                 | Etc.          |
| someone@example.com      | DOT - fhwa.dot.gov  | EPA - epa.gov        |               |
| someone.else@example.com | EPA - epa.gov/arc-x | GAO - Climate Change | DOI - fws.gov |
| learner@example.com      | DOI - blm.gov       |                      |               |

In this case, someone@example.com is assigned two domains, while learner@example.com is assigned only one. There can be any number of columns on each row.

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


## Getting Involved

We need your help! Please read through the [Web Monitoring Project](https://github.com/edgi-govdata-archiving/web-monitoring) project document and see what you can help with and check [EDGI’s contribution guidelines](https://github.com/edgi-govdata-archiving/overview/blob/master/CONTRIBUTING.md) for information on how to propose issues or changes.


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
| [💡](# "Examples") | [@lh00000000](https://github.com/lh00000000) |
| [💻](# "Code") [🎨](# "Design") [📖](# "Documentation") [💬](# "Answering Questions") [👀](# "Reviewer") | [Kevin Nguyen](https://github.com/lightandluck) |
| [📖](# "Documentation") [📋](# "Organizer") [📢](# "Talks") | [Matt Price](https://github.com/titaniumbones) |
| [📋](# "Organizer") [🔍](# "Funding/Grant Finder") | [Toly Rinberg](https://github.com/trinberg) |
| [💡](# "Examples") | [@StephenAlanBuckley](https://github.com/StephenAlanBuckley) |
| [💡](# "Examples") | [@stuartlynn](https://github.com/stuartlynn) |
| [📖](# "Documentation") [📋](# "Organizer") | [Dawn Walker](https://github.com/dcwalk) |
| [💻](# "Code") [⚠️](# "Tests") | [Alberto Zaccagni](https://github.com/lazywithclass) |
| [💻](# "Code") | [Michelle Truong](https://github.com/fendatr) |

<!-- ALL-CONTRIBUTORS-LIST:END -->

(For a key to the contribution emoji or more info on this format, check out [“All Contributors.”](https://github.com/kentcdodds/all-contributors))


## License & Copyright

Copyright (C) <2017> Environmental Data and Governance Initiative (EDGI)
This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, version 3.0.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

See the [`LICENSE`](https://github.com/edgi-govdata-archiving/web-monitoring-ui/blob/master/LICENSE) file for details.
