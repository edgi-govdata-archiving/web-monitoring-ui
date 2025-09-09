/* global globalThis */

import '@testing-library/jest-dom';
import nodeUtil from 'node:util';

// Workaround for JSDOM not yet implementing TextEncoder, which React-Router
// needs in the test environment: https://github.com/jsdom/jsdom/issues/2524
if (!globalThis.TextEncoder || !globalThis.TextDecoder) {
  globalThis.TextEncoder = nodeUtil.TextEncoder;
  globalThis.TextDecoder = nodeUtil.TextDecoder;
}
