import * as React from 'react';
import WebMonitoringDb, {Annotation, Page, Version} from '../services/web-monitoring-db';
import SelectDiffType from './select-diffType';
import SelectVersion from './select-version';
import DiffView from './diff-view';
import {Link, RouteComponentProps} from 'react-router-dom';
import AnnotationForm from './annotation-form';


export interface IChangeViewProps {
    page: Page;
}

export default class ChangeView extends React.Component<IChangeViewProps, any> {
    constructor (props: IChangeViewProps) {
        super (props);

        this.state = {
          diffType: undefined,
          a : null,
          b : null,
        };

        this.updateDiff = this.updateDiff.bind(this);
        this.handleVersionAChange = this.handleVersionAChange.bind(this);
        this.handleVersionBChange = this.handleVersionBChange.bind(this);
        this.handleDiffTypeChange = this.handleDiffTypeChange.bind(this);
        this.toggleCollapsedView = this.toggleCollapsedView.bind(this);
        this.saveAnnotation = this.saveAnnotation.bind(this);
        this.updateAnnotation = this.updateAnnotation.bind(this);
    }

    componentWillMount () {
        // const version = this.props.version;
        // getVersions(version.page_uuid, version.uuid).then((data: Version[]) => {
        //     this.setState({versions: data});
        // });
    }

    componentWillReceiveProps (nextProps: IChangeViewProps) {
        // if (this.props !== nextProps) {
        //     const version = nextProps.version;
        //     getVersions(version.page_uuid, version.uuid).then((data: Version[]) => {
        //         this.setState({versions: data});
        //     });
        // }
    }

    updateDiff() {

    }

    handleDiffTypeChange(diffType: any) {
      this.setState({diffType});
      this.updateDiff();
    }
    handleVersionAChange(version:Version) {
      this.setState({ a : version });
      this.updateDiff();
    }
    handleVersionBChange(version:Version) {
      this.setState({ b : version });
      this.updateDiff();
    }

    private updateAnnotation (newAnnotation: any) {
        this.setState({annotation: newAnnotation});
    }

    private saveAnnotation (event: React.SyntheticEvent<HTMLElement>) {
        event.preventDefault();
        // TODO: display some indicator that saving is happening/complete
        const version = this.state.version;
        this.context.api.annotateVersion(version.page_uuid, version.uuid, this.state.annotation);
    }

    render () {
        const { page } = this.props;
        const markAsSignificant = () => console.error('markAsSignificant not implemented');
        const addToDictionary = () => console.error('markAsSignificant not implemented');

        if (!page) {
          // if haz no page, don't render
          return (<div></div>);
        }

        return (
            <div>
                {/*<h3>Current version: {getDateString(this.props.version.capture_time.toString())}</h3>*/}
                <SelectDiffType value={this.state.diffType} onChange={this.handleDiffTypeChange} />
                <div>
                  <label>A</label>
                  <SelectVersion versions={page.versions} value={this.state.a} onChange={this.handleVersionAChange} />
                </div>
                <div>
                  <label>B</label>
                  <SelectVersion versions={page.versions} value={this.state.b} onChange={this.handleVersionBChange}  />
                </div>
                {renderSubmission()}
                <AnnotationForm
                    annotation={this.state.annotation}
                    onChange={this.updateAnnotation}
                    collapsed={this.state.collapsedView}
                />
                <DiffView pageId={page.uuid} diffType={this.state.diffType} a={this.state.a} b={this.state.b} />
            </div>
        );
    }

    renderSubmission () {
        if (!this.props.user) {
            return <div>Log in to submit annotations.</div>
        }
        return (
            <div>
                <div className="row">
                    <div className="col-md-6">
                        <i className="fa fa-toggle-on" aria-hidden="true" />
                        {/* TODO: should be buttons */}
                        <a className="lnk-action" href="#" onClick={this.toggleCollapsedView}>Toggle Signifiers</a>
                        <i className="fa fa-pencil" aria-hidden="true" />
                        <a className="lnk-action" href="#" onClick={this.saveAnnotation}>Update Record</a>
                        <i className="fa fa-list" aria-hidden="true" />
                        <Link to="/" className="lnk-action">Back to list view</Link>
                    </div>
                    <div className="col-md-6 text-right">
                        <i className="fa fa-upload" aria-hidden="true" />
                        <a className="lnk-action" href="#" onClick={markAsSignificant}>Add Important Change</a>
                        <i className="fa fa-database" aria-hidden="true" />
                        <a href="#" onClick={addToDictionary}>Add to Dictionary</a>
                    </div>
                </div>
            </div>
        );


    private toggleCollapsedView () {
        this.setState(previousState => ({collapsedView: !previousState.collapsedView}));
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

function getDateString (str: string): string {
    const date = new Date(str);
    const options = {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    };
    return `${date.toLocaleDateString('en-US', options)} ${date.toLocaleTimeString('en-US')}`;
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
