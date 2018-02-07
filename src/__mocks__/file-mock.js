// Webpack builds our assets into exported paths, but in testing, we need to
// mock that behavior (because Webpack is not there). This module stands in for
// any static file that Webpack would otherwise build.
export default 'test-file-fake-path';
