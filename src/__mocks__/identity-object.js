/**
 * An object where any key's value is the name of the key.
 * @example
 * identityObject.a === 'a';
 * identityObject.b === 'b';
 */
export default new Proxy({}, {
  get (target, key) {
    // Support Babel/Webpack CommonJS compilation, which uses __esModule.
    if (key === '__esModule') {
      return false;
    }
    return key;
  }
});
