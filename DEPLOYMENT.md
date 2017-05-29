# Deployment

The web-monitoring-ui is completely decoupled from the other web monitoring components and interacts only with [web-monitoring-db]([web-monitoring-db](https://github.com/edgi-govdata-archiving/web-monitoring-db) through db's JSON api. Anyone with a free [Heroku](www.heroku.com) account and credentials to web-monitoring-db can deploy web-monitoring-ui and have a fully functional instance of the application. You can still deploy without credentials but will not be able to update annotations or make other changes.

This deployment is simple and consists of:

1. A git clone of this repository
2. A free [Heroku](www.heroku.com) account and the [Heroku CLI tools setup](https://devcenter.heroku.com/articles/heroku-cli)
3. heroku-deploy.sh

## Environment Scripts

In our deployment, environment scripts are named `.env.[account name]`, e.g. `.env.versionista1`. You can name them anything you like, though. These should be a copy of the [`.env.sample`](https://github.com/edgi-govdata-archiving/web-monitoring-versionista-scraper/blob/master/.env.sample) script in this repository, but with all the values properly filled in.

Make sure that the `GOOGLE_STORAGE_KEY_FILE` variable points to `versionista-archive-key.json` (or whatever you have named it).


## Cron Shell Script

This script takes 3 arguments so that `cron` can run it with different configurations:

1. The name of the configuration environment script to load, e.g. `versionista1`.
2. The number of hours to cover in the scraper run
3. Where to store the scraped data on disk (this includes raw diffs, raw versions, and JSON files containing metadata about the versions and diffs)

## Updating/Upgrading

Updating the deployment is simplistic: just SSH into the server, go to the `web-monitoring-versionista-scraper` directory, and `git pull`. This isn’t an ideal process (it’s not very secure), but is what we currently have.
