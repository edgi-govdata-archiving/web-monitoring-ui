import JsDomEnvironment from 'jest-environment-jsdom';
import nodeUtil from 'node:util';


/**
 * Patch jest-environment-jsdom with a few customizations.
 */
export default class PatchedJsDomEnvironment extends JsDomEnvironment {
  constructor (...args) {
    super(...args);

    // Patch fetch-related globals using Node.js's globals. Not technically
    // spec-compliant, but good enough for our needs.
    // See: https://github.com/jsdom/jsdom/issues/1724
    this.global.fetch = fetch;
    this.global.Headers = Headers;
    this.global.Request = Request;
    this.global.Response = Response;
    this.global.ReadableStream = ReadableStream;
    this.global.TransformStream = TransformStream;

    // Jest's JSDOM also does not yet implement TextEncoder, which react-router
    // needs in the test environment.
    if (!this.global.TextEncoder || !this.global.TextDecoder) {
      this.global.TextEncoder = nodeUtil.TextEncoder;
      this.global.TextDecoder = nodeUtil.TextDecoder;
    }
  }
}
