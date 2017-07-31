import * as PropTypes from 'prop-types';
import * as React from 'react';
import {Link} from 'react-router-dom';
import {diffTypes} from '../constants/diff-types';
import WebMonitoringDb from '../services/web-monitoring-db';
import AnnotationForm from './annotation-form';
import DiffView from './diff-view';
import SelectDiffType from './select-diff-type';
import SelectVersion from './select-version';

const collapsedViewStorage = 'WebMonitoring.ChangeView.collapsedView';

/**
 * @typedef ChangeViewProps
 * @property {Page} page
 * @property {Object} user
 * @property {Function} _annotateChange
 */

/**
 * Display a change between two versions of a page.
 *
 * @class ChangeView
 * @extends {React.Component}
 * @param {ChangeViewProps} props
 */
export default class ChangeView extends React.Component {
    constructor (props) {
        super (props);

        this.state = {
          a: null,
          b: null,
          change: null,
          collapsedView: true,
          diffType: undefined
        };

        // TODO: unify this default state logic with componentWillReceiveProps
        const page = this.props.page;
        if (page.versions && page.versions.length > 1) {
            this.state.a = page.versions[1];
            this.state.b = page.versions[0];
            this.state.diffType = 'SIDE_BY_SIDE_RENDERED';
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
        this._toggleCollapsedView = this._toggleCollapsedView.bind(this);
        this._annotateChange = this._annotateChange.bind(this);
        this._updateAnnotation = this._updateAnnotation.bind(this);
    }

    componentWillMount () {
        this._updateChange();
    }

    componentWillReceiveProps (nextProps) {
        const nextVersions = nextProps.page.versions;
        if (nextVersions && nextVersions.length > 1) {
            this._updateChange(nextVersions[1], nextVersions[0]);
        }
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

    handleDiffTypeChange (diffType) {
      this.setState({diffType});
      this.updateDiff();
    }
    handleVersionAChange (version) {
        this._updateChange(version, null);
        this.updateDiff();
    }
    handleVersionBChange (version) {
        this._updateChange(null, version);
        this.updateDiff();
    }

    render () {
        const { page } = this.props;

        if (!page || !page.versions) {
          // if haz no page, don't render
          return (<div></div>);
        }

        return (
            <div className="change-view-container">
                {this.renderVersionSelector(page)}
                {this.renderSubmission()}
                <DiffView page={page} diffType={this.state.diffType} a={this.state.a} b={this.state.b} />
            </div>
        );
    }

    renderVersionSelector (page) {
        return (
            <form className="version-selector">
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
            return <div>Log in to submit annotations.</div>;
        }

        const markAsSignificant = () => console.error('markAsSignificant not implemented');
        const addToDictionary = () => console.error('addToDictionary not implemented');

        return [
            (
                <div className="change-view-actions">
                    <div className="row">
                        <div className="col-md-6">
                            <i className="fa fa-toggle-on" aria-hidden="true" />
                            {/* TODO: should be buttons */}
                            <a className="lnk-action" href="#" onClick={this._toggleCollapsedView}>Toggle Signifiers</a>
                            <i className="fa fa-pencil" aria-hidden="true" />
                            <a className="lnk-action" href="#" onClick={this._annotateChange}>Update Record</a>
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
            ),
            (
                <AnnotationForm
                    annotation={this.state.annotation}
                    onChange={this._updateAnnotation}
                    collapsed={this.state.collapsedView}
                />
            )
        ];
    }

    _toggleCollapsedView (event) {
        event.preventDefault();
        this.setState(previousState => ({collapsedView: !previousState.collapsedView}));
    }

    _updateAnnotation (newAnnotation) {
        this.setState({annotation: newAnnotation});
    }

    _annotateChange (event) {
        event.preventDefault();
        // TODO: display some indicator that saving is happening/complete
        const fromVersion = this.state.a.uuid;
        const toVersion = this.state.b.uuid;
        this.props.annotateChange(fromVersion, toVersion, this.state.annotation);
    }

    _updateChange (from, to) {
        from = from || this.state.a;
        to = to || this.state.b;

        if (!from || !to || changeMatches(this.state.change, {a: from, b: to})) {
            return;
        }

        this.setState({a: from, b: to, annotation: null, change: null});

        this.context.api.getChange(this.props.page.uuid, from.uuid, to.uuid)
            .then(change => {
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

ChangeView.contextTypes = {
    api: PropTypes.instanceOf(WebMonitoringDb)
};

function changeMatches (change, state) {
    if (!state) { return false; }
    const uuidFrom = state.a ? state.a.uuid : state.uuid_from;
    const uuidTo = state.b ? state.b.uuid : state.uuid_to;
    return change && change.uuid_from === uuidFrom && change.uuid_to === uuidTo;
}

/* Polyfill for Array.prototype.findIndex */
// https://tc39.github.io/ecma262/#sec-array.prototype.findIndex
if (!Array.prototype.findIndex) {
  Object.defineProperty(Array.prototype, 'findIndex', {
    value (predicate) {
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
