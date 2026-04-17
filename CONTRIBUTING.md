# Contributing Guidelines

We love improvements to our tools! EDGI has general [guidelines for contributing][edgi-contributing] and a [code of conduct][edgi-conduct] for all of our organizational repos.

## Here are some notes specific to this project:

### Submitting Web Monitoring Issues

Issues that are project-wide, or relate heavily to the interaction between different components, should be added to our [Web Monitoring issue queue](https://github.com/edgi-govdata-archiving/web-monitoring/issues). Component-specific issues should be added to their respective repository.


### Local Docker Development

The `Dockerfile` pulls its base images from [Docker Hardened Images][dhi] (`dhi.io/node:22-debian13-dev` for the dev/build stage and `dhi.io/node:22-debian13` for the release stage). Pulling from `dhi.io` requires authentication, so before your first `docker build` you need to log in:

```
docker login dhi.io
```

Use your Docker Hub username and password, or (recommended) a [Personal Access Token][dhub-pat] generated from your Docker Hub account settings.

[dhi]: https://www.docker.com/products/hardened-images/

Once logged in, build and run the release image locally:

```
docker build -t envirodgi/ui .
docker run -p 3001:3001 -e <ENVIRONMENT VARIABLES> envirodgi/ui
```

Then point your browser at `http://localhost:3001`.


### Working Inside the Container

Once the dev image is built, you can use it as an ad-hoc workspace — handy for matching CI's Node version or running commands without installing local tooling.

Get a shell:

```
docker build -t envirodgi/ui:dev --target dev .
docker run -it --rm envirodgi/ui:dev bash
```

Run one-off commands without dropping into a shell:

```
docker run --rm envirodgi/ui:dev npm run lint
docker run --rm envirodgi/ui:dev npm test
docker run --rm envirodgi/ui:dev npm run build
```

Tail logs from a running release container. The server writes to stdout, so `docker logs` is how you read its output:

```
docker run -d -p 3001:3001 --name ui envirodgi/ui
docker logs -f ui
```

Exec into an already-running container:

```
docker exec -it ui bash
```

Use the dev image (`envirodgi/ui:dev`) for interactive work. The release image is hardened and has a minimal userland; shell access may be limited or unavailable.


### VS Code / Dev Containers

A [`.devcontainer/devcontainer.json`](./.devcontainer/devcontainer.json) is included for contributors who use VS Code (or any editor that supports the [Dev Containers](https://containers.dev/) spec — JetBrains, GitHub Codespaces, etc.). It builds the `dev` stage of the `Dockerfile`, bind-mounts the repo at `/app`, keeps `node_modules` in a named volume to avoid masking it with the host's, bind-mounts your host `~/.gitconfig` read-only into the container so `git` commits from inside use your identity, forwards port 3001, runs `npm ci` on first create, and preinstalls the ESLint extension (`dbaeumer.vscode-eslint`).

In VS Code: install the **Dev Containers** extension, open the repo, and run **Dev Containers: Reopen in Container**. You still need to have run `docker login dhi.io` once on your host so the base image can be pulled.

> **Note:** the `~/.gitconfig` mount assumes a POSIX host path and currently only works on macOS and Linux. Windows contributors will need to adjust the mount (or remove it) in `devcontainer.json`.


### Code Style / Best Practices

The following are recommended code styling and best practices for the web-monitoring-ui repository. We also have best practices for related to all the [web-monitoring] project (https://github.com/edgi-govdata-archiving/web-monitoring/blob/main/CONTRIBUTING.md) repo.


### UI - Support

#### Browser Support:

Last two of every major browser (Chrome, Safari, Firefox, Edge) except IE


#### ES6+ allowed everywhere:

ES6 and above is allowed. A feature is allowed if it has been formally published or is a Stage 4 proposal.  Otherwise, it is not allowed.


### UI - Code Style / Best Practices

#### CSS Methodologies:

This project uses [CSS Modules](https://github.com/css-modules/css-modules) with the majority of the classes scoped at the component level. There is a `global.css` file to put classes that should be applied sitewide. There is a `base.css` file consisting of non-global shared classes that are imported by multiple components.


#### Organization of React files:

1. Constructor
2. Lifecycle methods
3. Public methods, usually passed as props to child components
4. Render
5. Additional render methods
6. Private
7. Utility functions outside of class definition -- these are useful only to the class so not worth pulling out into a file. They are not dependent on having a context. We neither use 'this' in the function, and calling 'this.utility' is wordy.


#### Private Functions/Methods:

In general, try to avoid “private” methods on objects or classes. If they are really needed, prefix their names with an underscore.

Private functions in a module (that is, functions that are not exported) are fine.


#### Spacing in code:

Overall, we recommend [Stroustrup](https://en.wikipedia.org/wiki/Indentation_style#Variant:_Stroustrup) spacing for blocks:

```js
if (foo) {
  bar();
}
else {
  baz();
}
```

Separate the `if`/`for`/`while` keyword from the condition, but don’t add extra spaces inside the parentheses in conditionals and loops:

```js
if (!this.state.pageId) {
```

Don’t add spaces between the function name and parentheses or within the parentheses when calling a function:

```js
this.props.onChange(versions.find(v => v.uuid === newValue));
```

Add spaces between the brackets and content in object literals:

```js
this.setState({ updating: true });
```

Add spaces between the brackets and and variable names when de-structuring:

```js
const { page } = this.props;
```

Use spaces between the function keyword, name, and arguments in function declarations:

```js
function foo (a) {
```


#### Units and layout - px, em, rem, vh, flexbox, grid:

Pixels for borders. Rems for fonts and spacing. Flexbox and Grid for layout.


<!-- Links -->
[edgi-conduct]: https://github.com/edgi-govdata-archiving/overview/blob/main/CONDUCT.md
[edgi-contributing]: https://github.com/edgi-govdata-archiving/overview/blob/main/CONTRIBUTING.md
