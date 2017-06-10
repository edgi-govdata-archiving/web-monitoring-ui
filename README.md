# web-monitoring-ui

This repository is part of the EDGI [Web Monitoring Project](https://github.com/edgi-govdata-archiving/web-monitoring).

This component works with [web-monitoring-db](https://github.com/edgi-govdata-archiving/web-monitoring-db) and [web-monitoring-processing](https://github.com/edgi-govdata-archiving/web-monitoring-processing) to support the next web monitoring workflow.

It’s a React.js and Typescript-based browser application with a Node.js backend with the following capabilities:
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


## Manual view
Access the main view at `http://localhost:3000`

Screenshot:
![screenshot](screenshot.png)


## Getting Involved

We need your help! Please read through the [Web Monitoring Project](https://github.com/edgi-govdata-archiving/web-monitoring) project document and see what you can help with and check [EDGI’s contribution guidelines](https://github.com/edgi-govdata-archiving/overview/blob/master/CONTRIBUTING.md) for information on how to propose issues or changes.

## Contributors

This project wouldn’t exist without a lot of amazing people’s help. Thanks to the following for all their contributions!

<!-- ALL-CONTRIBUTORS-LIST:START -->
| Contributions | Name |
| :---: | :---: |
| [💻](# "Code") [🎨](# "Design") [📖](# "Documentation") [💬](# "Answering Questions") [👀](# "Reviewer") | [Kevin Nguyen](https://github.com/lightandluck) |
| [💻](# "Code") [📖](# "Documentation") [💬](# "Answering Questions") | [Rob Brackett](https://github.com/Mr0grog) |
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

<!-- ALL-CONTRIBUTORS-LIST:END -->

(For a key to the contribution emoji or more info on this format, check out [“All Contributors.”](https://github.com/kentcdodds/all-contributors))

## License & Copyright

Copyright (C) <2017> Environmental Data and Governance Initiative (EDGI)
This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, version 3.0.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

See the [`LICENSE`](https://github.com/edgi-govdata-archiving/web-monitoring-ui/blob/master/LICENSE) file for details.
