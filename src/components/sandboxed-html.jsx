import { PureComponent } from 'react';

/**
 * @typedef {Object} SandboxedHtmlProps
 * @property {string} html The HTML source or document to render
 * @property {string} [baseUrl] A base URL to set for the view
 * @property {(HTMLDocument) => HTMLDocument} [transform] An optional transform
 *           function to apply to the document before rendering.
 */

/**
 * Display HTML source code or document in a sandboxed frame.
 *
 * @class SandboxedHtml
 * @extends {PureComponent}
 * @param {SandboxedHtmlProps} props
 */
export default class SandboxedHtml extends PureComponent {
  constructor (props) {
    super(props);
    this._frame = null;
  }

  componentDidMount () {
    this._updateContent();
  }

  componentDidUpdate () {
    this._updateContent();
  }

  render () {
    // 'allow-popups' is needed for addTargetBlank for html-transforms.js
    return <iframe
      sandbox="allow-forms allow-scripts allow-popups"
      ref={frame => this._frame = frame}
    />;
  }

  /**
   * Use the `window.postMessage()` API to send a message to the JS code
   * running in this SandboxedHtml view. To use this, you'll need to keep a ref
   * to this component.
   * @param {any} message
   */
  postMessage (message) {
    if (this._frame) {
      this._frame.contentWindow.postMessage(message, '*');
    }
    else {
      console.warn('Tried to post message with no reference to `_frame`');
    }
  }

  _updateContent () {
    let source = transformSource(this.props.html, document => {
      if (this.props.transform) {
        document = this.props.transform(document) || document;
      }
      return setDocumentBase(document, this.props.baseUrl);
    });

    this._frame.setAttribute('srcdoc', source);
  }
}

/**
 * Run a transform function against an HTML source code string or document and
 * return the resulting HTML source code.
 * @private
 *
 * @param {string} source
 * @param {(HTMLDocument) => HTMLDocument} transformer
 * @returns {string}
 */
function transformSource (source, transformer) {
  const parser = new DOMParser();
  let newDocument = parser.parseFromString(source, 'text/html');
  newDocument = transformer(newDocument);
  return `<!doctype html>\n${newDocument.documentElement.outerHTML}`;
}

/**
 * Set the `base` URL for a document, which alters where links, images, etc.
 * point to if they do not include a domain name.
 * @private
 *
 * @param {HTMLDocument} document
 * @param {string} baseUrl
 * @returns {HTMLDocument}
 */
function setDocumentBase (document, baseUrl) {
  if (baseUrl) {
    const base = document.querySelector('base')
      || document.createElement('base');
    base.href = baseUrl;

    // <meta charset> tags don't work unless they are first, so if one is
    // present, modify <head> content *after* it.
    const charsetElement = document.querySelector('meta[charset]');
    let beforeElement = document.head.firstChild;
    if (charsetElement) {
      beforeElement = charsetElement.nextSibling;
    }
    if (beforeElement) {
      beforeElement.parentNode.insertBefore(base, beforeElement);
    }
    else {
      document.head.appendChild(base);
    }
  }

  return document;
}
