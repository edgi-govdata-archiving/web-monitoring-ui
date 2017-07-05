import * as React from 'react';
import {Version} from '../services/web-monitoring-db';
import SelectVersion from './select-version';

export interface IDiffViewProps {
    currentVersionUUID: string;
    currentPageUUID: string;
}

export default class DiffView extends React.Component<IDiffViewProps, any> {
    constructor (props: IDiffViewProps) {
        super (props);
        this.state = {versions: []};
    }
    componentWillMount () {
        getVersions(this.props.currentPageUUID, this.props.currentVersionUUID).then((data: Version[]) => {
            this.setState({versions: data});
        });
    }
    render () {
        return (
            <div>
                <em>Diff to be displayed here.</em>
                <SelectVersion versions={this.state.versions} />
            </div>
        );
    }
}

function getVersions (currentPageUUID: string, currentVersionUUID: string): Promise<Version[]> {
    const dataUrl = `https://web-monitoring-db-staging.herokuapp.com/api/v0/pages/${currentPageUUID}`;

    return fetch(dataUrl)
        .then(blob => blob.json())
        .then((json: any) => {
            const data = json.data;
            const currentIndex = data.versions.findIndex((element: Version) => {
                return element.uuid === currentVersionUUID;
            });
            data.versions.splice(currentIndex, 1);
            return data.versions;
        });
}

/* Polyfill for Array.prototype.findIndex */
// https://tc39.github.io/ecma262/#sec-array.prototype.findIndex
if (!Array.prototype.findIndex) {
  Object.defineProperty(Array.prototype, 'findIndex', {
    value (predicate: any) {
     // 1. Let O be ? ToObject(this value).
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      const o = Object(this);

      // 2. Let len be ? ToLength(? Get(O, "length")).
      const len = o.length >>> 0;

      // 3. If IsCallable(predicate) is false, throw a TypeError exception.
      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      }

      // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
      const thisArg = arguments[1];

      // 5. Let k be 0.
      let k = 0;

      // 6. Repeat, while k < len
      while (k < len) {
        // a. Let Pk be ! ToString(k).
        // b. Let kValue be ? Get(O, Pk).
        // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
        // d. If testResult is true, return k.
        const kValue = o[k];
        if (predicate.call(thisArg, kValue, k, o)) {
          return k;
        }
        // e. Increase k by 1.
        k++;
      }

      // 7. Return -1.
      return -1;
    }
  });
}

function loadIframe (htmlEmbed: string) {
    // inject html
    const iframe = document.getElementById('diff_view');
    iframe.setAttribute('srcdoc', htmlEmbed);

    iframe.onload = () => {
        // inject diff.css to highlight <ins> and <del> elements
        const frm = (frames as any).diff_view.contentDocument;
        const otherhead = frm.getElementsByTagName('head')[0];
        const link = frm.createElement('link');
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('type', 'text/css');
        link.setAttribute('href', `${window.location.origin}/css/diff.css`);
        otherhead.appendChild(link);

        // set iframe height = frame content
        iframe.setAttribute('height', (iframe as any).contentWindow.document.body.scrollHeight);
    };
}
