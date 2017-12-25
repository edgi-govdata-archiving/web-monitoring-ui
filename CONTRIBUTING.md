# Contributing Guidelines

We love improvements to our tools! EDGI has general [guidelines for contributing](https://github.com/edgi-govdata-archiving/overview/blob/master/CONTRIBUTING.md) to all of our organizational repos.

## Submitting Web Monitoring Issues

Issues that are project-wide, or relate heavily to the interaction between different components, should be added to our [Web Monitoring issue queue](https://github.com/edgi-govdata-archiving/web-monitoring/issues). Component-specific issues should be added to their respective repository.

The following are recommended code styling and best practices for the web-monitoring-ui repository. We also have best practices for related to all the [web-monitoring] project (https://github.com/edgi-govdata-archiving/web-monitoring/blob/master/CONTRIBUTING.md) repo.

## UI - Support
### Browser Support:
Last two of every major browser (Chrome, Safari, Firefox, Edge) except IE

### ES6+ allowed everywhere
ES6 and above is allowed. A feature is allowed if it has been formally published or is a Stage 4 proposal.  Otherwise, it is not allowed.

## UI - Code Style / Best Practices

### CSS Methodologies:
Recommend BEM as much as possible (as opposed to (OOCSS, SMACSS, ITCSS)

### Organization of React files:
a) Constructor
b) Lifecycle methods
c) Public methods, usually passed as props to child components
d) Render
e) Additional render methods 
f) Private 
g) Utility functions outside of class definition these are useful only to the class so not worth pulling out into a file. They are not dependent on having a context. We neither use 'this' in the function, and calling 'this.utility' is wordy.

### Underscore Private functions:
Note: in general, try to avoid private functions.

### Spacing in code:
Overall, we recommend [Stroustrup](https://en.wikipedia.org/wiki/Indentation_style#Variant:_Stroustrup) spacing.

```
if (foo) {
bar();
}
else {
  baz();
}
```


Some React Examples:
Conditionals:

```if (!this.state.pageId)```

Function invocation

```this.props.onChange(versions.find(v => v.uuid === newValue));```

Function invocation with objects

```this.setState({updating: true})```

De-structuring:

```const {page} = this.props```

Function declarations:

```function foo (a)```

### Units and layout - px, em, rem, vh, flexbox, grid:
Pixels for borders. Rems for fonts and spacing. Vh, vw for layout. 
Flexbox: Grid or nested Flexbox (Kevin, should this be included?)


