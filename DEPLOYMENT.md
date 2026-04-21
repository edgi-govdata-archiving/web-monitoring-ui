# Deployment

Web-monitoring-ui is deployed on Kubernetes. Docker image builds are automated via CI on the `release` branch. Deploying to Kubernetes is a manual step managed in [web-monitoring-ops](https://github.com/edgi-govdata-archiving/web-monitoring-ops).

The release image is built from [Docker Hardened Images](https://docs.docker.com/dhi/) (`dhi.io/node`). The CI environment (and any local build host) must be authenticated to `dhi.io` and have access to the `node` hardened image repository for `docker build` to succeed.

The application is decoupled from the other [web monitoring](https://github.com/edgi-govdata-archiving/web-monitoring) components and interacts only with [web-monitoring-db](https://github.com/edgi-govdata-archiving/web-monitoring-db).

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `WEB_MONITORING_DB_URL` | URL of the web-monitoring-db API | `https://api.monitoring.envirodatagov.org` |
| `FORCE_SSL` | Redirect all HTTP requests to HTTPS | _(unset)_ |
| `ALLOW_PUBLIC_VIEW` | Allow browsing without logging in | `true` |
