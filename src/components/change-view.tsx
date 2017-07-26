import * as PropTypes from 'prop-types';
import * as React from 'react';
import {Link} from 'react-router-dom';
import WebMonitoringDb, {Annotation, Change, Page, Version} from '../services/web-monitoring-db';
import AnnotationForm from './annotation-form';
import DiffView from './diff-view';
import SelectDiffType from './select-diffType';
import SelectVersion from './select-version';

const collapsedViewStorage = 'WebMonitoring.ChangeView.collapsedView';

export interface IChangeViewProps {
    page: Page;
    user: any;
    annotateChange: any;
}

export default class ChangeView extends React.Component<IChangeViewProps, any> {
    static contextTypes = {
        api: PropTypes.instanceOf(WebMonitoringDb)
    };

    context: {api: WebMonitoringDb};

    constructor (props: IChangeViewProps) {
        super (props);

        this.state = {
          a: null,
          b: null,
          change: null,
          collapsedView: true,
          diffType: undefined
        };
        const page = this.props.page;
        if (page.versions && page.versions.length > 1) {
            this.state.a = page.versions[1];
            this.state.b = page.versions[0];
        }
        if ('sessionStorage' in window) {
            this.state.collapsedView = sessionStorage.getItem(
                collapsedViewStorage
            ) !== 'false';
        }

        this.updateDiff = this.updateDiff.bind(this);
        this.handleVersionAChange = this.handleVersionAChange.bind(this);
        this.handleVersionBChange = this.handleVersionBChange.bind(this);
        this.handleDiffTypeChange = this.handleDiffTypeChange.bind(this);
        this.toggleCollapsedView = this.toggleCollapsedView.bind(this);
        this.annotateChange = this.annotateChange.bind(this);
        this.updateAnnotation = this.updateAnnotation.bind(this);
    }

    componentWillMount () {
        this.updateChange();
    }

    componentWillReceiveProps (nextProps: IChangeViewProps) {
        // if (this.props !== nextProps) {
        //     const version = nextProps.version;
        //     getVersions(version.page_uuid, version.uuid).then((data: Version[]) => {
        //         this.setState({versions: data});
        //     });
        // }
    }

    componentDidUpdate () {
        if ('sessionStorage' in window) {
            sessionStorage.setItem(
                collapsedViewStorage,
                this.state.collapsedView.toString()
            );
        }
    }

    updateDiff () {
        // pass
    }

    handleDiffTypeChange (diffType: any) {
      this.setState({diffType});
      this.updateDiff();
    }
    handleVersionAChange (version: Version) {
        this.updateChange(version, null);
        this.updateDiff();
    }
    handleVersionBChange (version: Version) {
        this.updateChange(null, version);
        this.updateDiff();
    }

    render () {
        const { page } = this.props;

        if (!page || !page.versions) {
          // if haz no page, don't render
          return (<div></div>);
        }

        return (
            <div className="change-view">
                {this.renderVersionSelector(page)}
                {this.renderSubmission()}
                <DiffView page={page} diffType={this.state.diffType} a={this.state.a} b={this.state.b} />
            </div>
        );
    }

    renderVersionSelector (page: Page) {
        return (
            <form className="version-selector">
                {/*<h3>Current version: {getDateString(this.props.version.capture_time.toString())}</h3>*/}
                <label className="version-selector__item form-group">
                    <span>Comparison:</span>
                    <SelectDiffType value={this.state.diffType} onChange={this.handleDiffTypeChange} />
                </label>
                <label className="version-selector__item form-group">
                    <span>From:</span>
                    <SelectVersion versions={page.versions} value={this.state.a} onChange={this.handleVersionAChange} />
                </label>
                <label className="version-selector__item form-group">
                    <span>To:</span>
                    <SelectVersion versions={page.versions} value={this.state.b} onChange={this.handleVersionBChange} />
                </label>
            </form>
        );
    }

    renderSubmission () {
        if (!this.props.user) {
            return <div>Log in to submit annotations.</div>
        }

        const markAsSignificant = () => console.error('markAsSignificant not implemented');
        const addToDictionary = () => console.error('addToDictionary not implemented');

        return (
            <div>
                <div className="row">
                    <div className="col-md-6">
                        <i className="fa fa-toggle-on" aria-hidden="true" />
                        {/* TODO: should be buttons */}
                        <a className="lnk-action" href="#" onClick={this.toggleCollapsedView}>Toggle Signifiers</a>
                        <i className="fa fa-pencil" aria-hidden="true" />
                        <a className="lnk-action" href="#" onClick={this.annotateChange}>Update Record</a>
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
                <AnnotationForm
                    annotation={this.state.annotation}
                    onChange={this.updateAnnotation}
                    collapsed={this.state.collapsedView}
                />
            </div>
        );
    }

    private toggleCollapsedView (event: any) {
        event.preventDefault();
        this.setState(previousState => ({collapsedView: !previousState.collapsedView}));
    }

    private updateAnnotation (newAnnotation: any) {
        this.setState({annotation: newAnnotation});
    }

    private annotateChange (event: React.SyntheticEvent<HTMLElement>) {
        event.preventDefault();
        // TODO: display some indicator that saving is happening/complete
        const fromVersion = this.state.a.uuid;
        const toVersion = this.state.b.uuid;
        this.props.annotateChange(fromVersion, toVersion, this.state.annotation);
    }

    private updateChange (from?: Version, to?: Version) {
        from = from || this.state.a;
        to = to || this.state.b;

        if (!from || !to || changeMatches(this.state.change, {a: from, b: to})) {
            return;
        }

        this.setState({a: from, b: to, annotation: null, change: null});

        this.context.api.getChange(this.props.page.uuid, from.uuid, to.uuid)
            .then((change: Change) => {
                // only update state.change if what we want is still the same
                // and we don't already have it
                if (!changeMatches(change, this.state.change) && changeMatches(change, this.state)) {
                    this.setState({
                        annotation: Object.assign({}, change.current_annotation),
                        change
                    });
                }
            });
    }
}

function changeMatches (change: Change, state: any) {
    if (!state) { return false; }
    const uuidFrom = state.a ? state.a.uuid : state.uuid_from;
    const uuidTo = state.b ? state.b.uuid : state.uuid_to;
    return change && change.uuid_from === uuidFrom && change.uuid_to === uuidTo;
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
