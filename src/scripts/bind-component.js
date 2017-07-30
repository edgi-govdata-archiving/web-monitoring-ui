import * as React from 'react';

/**
 * Similar to function.bind, but binds props to component types. Returns a
 * new component type that will always include the provided props. If the
 * component is instantiated with a different value for a prop that has been
 * bound, the instance-specific value takes precedence.
 *
 *     const Special = bindComponent({a: 'bound', b: 'bound'}, BoringComponent);
 *     <Special b="not bound" c="who knows" />
 *
 * Creates an instance of BoringComponent with the following props:
 *
 *     {a: 'bound', b: 'not bound', c: 'who knows'}
 *
 * Calling with only a set of props and no component type returns a curried
 * version of this function, so you can call the result again with a component
 * type to get a bound component:
 *
 *     const withAAndB = bindComponent({a: 'bound', b: 'bound'});
 *     const FancyComponent = withAAndB(BoringComponent);
 *     <FancyComponent c="another prop" />
 *
 *
 * @param {Object} props Props to bind
 * @param {React.ComponentClass} [Component] The component to bind to
 * @returns {React.StatelessComponent | (React.ComponentClass) => React.StatelessComponent}
 */
export default function bindComponent (props, Component) {
    if (!Component) {
        return bindComponent.bind(null, props);
    }
    return (addedProps) => React.createElement(Component, Object.assign({}, props, addedProps));
}
