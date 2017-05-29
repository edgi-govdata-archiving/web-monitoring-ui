# Deployment

The web-monitoring-ui is decoupled from the other web monitoring components and interacts only with [web-monitoring-db](https://github.com/edgi-govdata-archiving/web-monitoring-db) through db's JSON api. Anyone with a free Heroku account and credentials to web-monitoring-db can deploy web-monitoring-ui and have a fully functional instance of the application. You can still deploy without credentials but will not be able to update annotations or make other changes to the web-monitoring-db.

This deployment is simple and consists of:

1. A git clone of this repository
2. A free [Heroku](www.heroku.com) account and the [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) setup
3. The script found at `/scripts/heroku-deploy.sh`

## Environment Variables

In our deployment, environment variables are named
1. `WEB_MONITORING_DB_URL`
2. `WEB_MONITORING_DB_USER`
3. `WEB_MONITORING_DB_PASSWORD`

All are optional, but you will need credentials to update annotations.

## Shell script

The script takes 2 arguments that are optional.

1. The name of the heroku remote to deploy to. This is useful if you have multiple heroku remotes or have renamed them. It defaults to `heroku`.
2. The name of the local branch to be deployed. It defaults to `master`. Supplying this argument is useful if you want to deploy a branch other than master.

WARNING! - The script assumes and pushes from a branch named `heroku-deploy`. It will create one or switch to it if it exists. If you already have a branch named `heroku-deploy`, rename the `deployTo` variable in the script or make sure you don't care what happens to `heroku-deploy` before running.

