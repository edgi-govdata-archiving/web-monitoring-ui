# web-monitoring-ui

This repository is part of the EDGI [Web Monitoring Project](https://github.com/edgi-govdata-archiving/web-monitoring).

This component works with [web-monitoring-db](https://github.com/edgi-govdata-archiving/web-monitoring-db) and [web-monitoring-processing](https://github.com/edgi-govdata-archiving/web-monitoring-processing) to support the next web monitoring workflow.

It’s a React.js-based browser application with a Node.js backend with the following capabilities:
* Consume subset of data from web-monitoring-db as proof of concept, read/write annotations
    * [DEMO](https://edgi-web-monitor-ui.herokuapp.com)
    * LIST VIEW shows first page of records from [web-monitor-db](https://web-monitoring-db.herokuapp.com/api/v0/pages) JSON endpoint
    * PAGE VIEW shows basic info about the latest version of that page: site, urls, and links to Versionista diffs
        * updates annotations

## Installation

1. Ensure you have yarn ([installation instructions](https://yarnpkg.com/en/docs/install))
2. Clone this repo
3. Install node dependencies with `yarn`

    ```sh
    yarn install
    ```

4. Copy `.env.example` to `.env` and supply any local configuration info you need (all fields are optional)
5. Build the application

    ```sh
    gulp
    ```

6. Start the web server

    ```sh
    yarn run start
    ```

7. If you are actively developing then use gulp to rebuild application on file changes

   ```sh
   gulp watch
   ```

8. (Optional) Set up user tasking data in a Google Sheet. If you skip this step, everything will work fine, but your UI will show all pages when logged in, not just your assigned pages. See the section below on [creating tasking sheets](#creating-tasking-sheets).

## Running tests

To run all tests once

```sh
yarn test
```

while to start the test runner in watch mode

```sh
yarn dev
```

## Manual view
Access the main view at `http://localhost:3000`

Screenshot:
![screenshot](screenshot.png)


## Creating Tasking Sheets

User tasking data (analysis timeframes, who is assigned what domains and pages, etc.) is currently kept in a Google Docs spreadsheet for easy manipulation by project admins. To enable tasking in your local build, you’ll need to create your own copy of this spreadsheet.

First, create a spreadsheet in Google Docs. It should have two worksheets or tabs, named:

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

Finally, share the spreadsheet so that “anyone with the link can view.”

Once you have the sheets created, update your `.env` file with two variables:

```sh
# Your own API key for access to Google sheets. For details on how to get one, see:
# https://developers.google.com/api-client-library/javascript/start/start-js#setup
GOOGLE_SHEETS_API_KEY=1Q8KNlXXXXXXXX3AwBSFteudrz_bnPj3_KeeA37JkPvk

# ID of the Google Sheet we created above. For more on how to get the ID, see:
# https://developers.google.com/sheets/api/guides/concepts#spreadsheet_id
GOOGLE_TASK_SHEET_ID=AIzaSyAChRujfXXXXXXXXMP5eouRRQ6bxV-1u_o
```


## Important Changes and Dictionary Sheets

In the current workflow, 2 Google Docs spreadsheets are used to keep track of 'important changes' and 'dictionary' records. The UI at this time posts annotations to DB with these attributes and also push to the spreadsheets. To get them


## Getting Involved

We need your help! Please read through the [Web Monitoring Project](https://github.com/edgi-govdata-archiving/web-monitoring) project document and see what you can help with and check [EDGI’s contribution guidelines](https://github.com/edgi-govdata-archiving/overview/blob/master/CONTRIBUTING.md) for information on how to propose issues or changes.


## Troubleshooting

#### `The program 'gulp' is currently not installed`

If your run into `The program 'gulp' is currently not installed` error then you can either:

1. Use local development install of gulp

    ```sh
    yarn run gulp
    # or
    npm run gulp
    ```

2. Install gulp globally

   ```sh
   yarn install --global gulp-cli
   ```

## Contributors

This project wouldn’t exist without a lot of amazing people’s help. Thanks to the following for all their contributions!

<!-- ALL-CONTRIBUTORS-LIST:START -->
| Contributions | Name |
| :---: | :---: |
| [💻](# "Code") [🎨](# "Design") [📖](# "Documentation") [💬](# "Answering Questions") [👀](# "Reviewer") | [Kevin Nguyen](https://github.com/lightandluck) |
| [💻](# "Code") [📖](# "Documentation") [💬](# "Answering Questions") [👀](# "Reviewer") | [Rob Brackett](https://github.com/Mr0grog) |
| [📖](# "Documentation") [📋](# "Organizer") [💬](# "Answering Questions") [👀](# "Reviewer") | [Dan Allan](https://github.com/danielballan) |
| [📖](# "Documentation") [📋](# "Organizer") [📢](# "Talks") | [Matt Price](https://github.com/titaniumbones) |
| [📖](# "Documentation") [📋](# "Organizer") | [Dawn Walker](https://github.com/dcwalk) |
| [📖](# "Documentation") | [Patrick Connolly](https://github.com/patcon) |
| [📋](# "Organizer") [🔍](# "Funding/Grant Finder") | [Toly Rinberg](https://github.com/trinberg) |
| [📋](# "Organizer") [🔍](# "Funding/Grant Finder") | [Andrew Bergman](https://github.com/ambergman) |
| [💡](# "Examples") | [@ArcTanSusan](https://github.com/ArcTanSusan) |
| [💡](# "Examples") | [@AutumnColeman](https://github.com/AutumnColeman) |
| [💡](# "Examples") | [@StephenAlanBuckley](https://github.com/StephenAlanBuckley) |
| [💡](# "Examples") | [@lh00000000](https://github.com/lh00000000) |
| [💡](# "Examples") | [@stuartlynn](https://github.com/stuartlynn) |
| [💡](# "Examples") | [@allanpichardo](https://github.com/allanpichardo) |
| [⚠️](# "Tests") | [Alberto Zaccagni](https://github.com/lazywithclass) |

<!-- ALL-CONTRIBUTORS-LIST:END -->

(For a key to the contribution emoji or more info on this format, check out [“All Contributors.”](https://github.com/kentcdodds/all-contributors))

## License & Copyright

Copyright (C) <2017> Environmental Data and Governance Initiative (EDGI)
This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, version 3.0.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

See the [`LICENSE`](https://github.com/edgi-govdata-archiving/web-monitoring-ui/blob/master/LICENSE) file for details.
