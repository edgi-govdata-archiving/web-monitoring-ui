# Contributing Guidelines

We love improvements to our tools! EDGI has general [guidelines for contributing][edgi-contributing] and a [code of conduct][edgi-conduct] for all of our organizational repos.

## Here are some notes specific to this project:

### Submitting Web Monitoring Issues

Issues that are project-wide, or relate heavily to the interaction between different components, should be added to our [Web Monitoring issue queue](https://github.com/edgi-govdata-archiving/web-monitoring/issues). Component-specific issues should be added to their respective repository.


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
