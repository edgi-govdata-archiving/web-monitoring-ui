# web-monitoring-ui

This repository is part of the EDGI [Web Monitoring Project](https://github.com/edgi-govdata-archiving/web-monitoring).

This component works with [web-monitoring-db](https://github.com/edgi-govdata-archiving/web-monitoring-db) and [web-monitoring-processing](https://github.com/edgi-govdata-archiving/web-monitoring-processing) to support the next web monitoring workflow.

A node application with the following capabilities:
* Consume subset of data from web-monitoring-db as proof of concept, read/write annotations
    * [DEMO](https://edgi-web-monitor-ui.herokuapp.com)
    * LIST VIEW shows first 10 records from [web-monitor-db](https://web-monitoring-db.herokuapp.com/pages.json) json endpoint
    * PAGE VIEW shows basic info about record: site, urls, and links to versionista diffs
        * paginate through records

## Usage
* Install node dependencies with `npm install`, 
* Rename `dist/config.json.example` to `config.json` and supply web-monitoring-db user and pass
* Run `gulp`
* Run `node app.js`

## Manual view
Access the main view at `http://localhost:3000`

Screenshot:
![screenshot](screenshot.png)

## Getting Involved

We need your help! Please read through the [Web Monitoring Project](https://github.com/edgi-govdata-archiving/web-monitoring) project document and see what you can help with!
