# Deployment

Web-monitoring-ui is decoupled from the other [web monitoring](https://github.com/edgi-govdata-archiving/web-monitoring) components and interacts only with [web-monitoring-db](https://github.com/edgi-govdata-archiving/web-monitoring-db) through web-monitoring-db's JSON api. Anyone with a Heroku account and credentials to web-monitoring-db, can deploy web-monitoring-ui and have a fully functional instance of the application. You can still deploy without credentials but will not be able to update annotations or make other changes to web-monitoring-db.

This deployment is simple and consists of:

1. A git clone of this repository
2. A free [Heroku](www.heroku.com) account and the [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) setup
3. The script found at `/scripts/heroku-deploy.sh`

## Environment Variables

In our deployment, environment variables are named:

1. `WEB_MONITORING_DB_URL`
2. `FORCE_SSL`

## Shell script

The script takes 2 arguments that are optional.

1. The name of the heroku remote to deploy to. This is useful if you have multiple heroku remotes or have renamed them. It defaults to `heroku`.
2. The name of the local branch to be deployed. It defaults to `main`. Supplying this argument is useful if you want to deploy a branch other than main.

The script assumes and pushes from a branch named `heroku-deploy`. It will create one or switch to it if it exists. You can't have a branch named `heroku-deploy` that you are working in if you plan on using the script.
