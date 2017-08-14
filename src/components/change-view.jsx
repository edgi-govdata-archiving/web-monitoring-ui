import PropTypes from 'prop-types';
import React from 'react';
import {Link} from 'react-router-dom';
import {diffTypes} from '../constants/diff-types';
import WebMonitoringDb from '../services/web-monitoring-db';
import WebMonitoringApi from '../services/web-monitoring-api';
import AnnotationForm from './annotation-form';
import DiffView from './diff-view';
import SelectDiffType from './select-diff-type';
import SelectVersion from './select-version';

const collapsedViewStorage = 'WebMonitoring.ChangeView.collapsedView';

/**
 * @typedef ChangeViewProps
 * @property {Page} page
 * @property {Version} from
 * @property {Version} to
 * @property {Object} user
 * @property {Function} annotateChange
 * @property {Function} onChangeSelectedVersions
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
      change: null,
      annotation: {},
      collapsedView: true,
      diffType: undefined,
      addingToDictionary: false,
      addingToImportant: false
    };

    // TODO: unify this default state logic with componentWillReceiveProps
    const page = this.props.page;
    if (page.versions && page.versions.length > 1) {
      this.state.diffType = 'SIDE_BY_SIDE_RENDERED';
    }

    if ('sessionStorage' in window) {
      this.state.collapsedView = sessionStorage.getItem(
        collapsedViewStorage
      ) !== 'false';
    }

    this.updateDiff = this.updateDiff.bind(this);
    this.handleFromVersionChange = this.handleFromVersionChange.bind(this);
    this.handleToVersionChange = this.handleToVersionChange.bind(this);
    this.handleDiffTypeChange = this.handleDiffTypeChange.bind(this);
    this._toggleCollapsedView = this._toggleCollapsedView.bind(this);
    this._annotateChange = this._annotateChange.bind(this);
    this._updateAnnotation = this._updateAnnotation.bind(this);
    this._markAsSignificant = this._markAsSignificant.bind(this);
    this._addToDictionary = this._addToDictionary.bind(this);
  }

  componentWillMount () {
    this._getChange();
  }

  componentWillReceiveProps (nextProps) {
    const nextVersions = nextProps.page.versions;
    if (nextVersions && nextVersions.length > 1) {
      this._getChange(nextVersions[1], nextVersions[0]);
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
  handleFromVersionChange (version) {
    this._changeSelectedVersions(version, null);
    this.updateDiff();
  }
  handleToVersionChange (version) {
    this._changeSelectedVersions(null, version);
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
        {this.renderSubmission()}
        {this.renderVersionSelector(page)}
        <DiffView page={page} diffType={this.state.diffType} a={this.props.from} b={this.props.to} />
      </div>
    );
  }

  renderVersionSelector (page) {
    return (
      <form className="version-selector">
        <label className="version-selector__item">
          <span>From:</span>
          <SelectVersion versions={page.versions} value={this.props.from} onChange={this.handleFromVersionChange} />
        </label>
        <label className="version-selector__item">
          <span>Comparison:</span>
          <SelectDiffType value={this.state.diffType} onChange={this.handleDiffTypeChange} />
        </label>

        <label className="version-selector__item">
          <span>To:</span>
          <SelectVersion versions={page.versions} value={this.props.to} onChange={this.handleToVersionChange} />
        </label>
      </form>
    );
  }

  // TODO: change-view.jsx is becoming very unwieldy with multiple render methods and custom components.
  // We should extract out some of these renders and the 'markSignificant' and 'addToDictionary' components below.
  renderSubmission () {
    if (!this.props.user) {
      return <div>Log in to submit annotations.</div>;
    }

    const annotation = this.state.annotation || {};

    let markSignificant;
    if (annotation.significance >= 0.5) {
      markSignificant = <span className="status lnk-action">Significant</span>;
    }
    else {
      markSignificant = (
        <span className="lnk-action">
          <i className="fa fa-upload" aria-hidden="true" />
          <button
            className="btn btn-link"
            disabled={this.state.addingToImportant}
            onClick={this._markAsSignificant}
          >
              Add Important Change
          </button>
        </span>
      );
    }

    let addToDictionary;
    if (annotation.isDictionary) {
      addToDictionary = <span className="status">In dictionary</span>;
    }
    else {
      addToDictionary = (
        <span>
          <i className="fa fa-database" aria-hidden="true" />
          <button
            className="btn btn-link"
            disabled={this.state.addingToDictionary}
            onClick={this._addToDictionary}
          >
              Add to Dictionary
          </button>
        </span>
      );
    }

    // Returning array of controls so that we don't have an extraneous containing div
    return [
      (
        <div className="row change-view-actions" key="change-view-actions">
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
            {markSignificant}
            {addToDictionary}
          </div>
        </div>
      ),
      (
        <AnnotationForm
          annotation={annotation}
          onChange={this._updateAnnotation}
          collapsed={this.state.collapsedView}
          key="annotation-form"
        />
      )
    ];
  }

  _toggleCollapsedView (event) {
    event.preventDefault();
    this.setState(previousState => ({collapsedView: !previousState.collapsedView}));
  }

  _markAsSignificant (event) {
    event.preventDefault();
    if (isDisabled(event.currentTarget)) return;

    let annotation = this.state.annotation;
    if (!annotation.significance || annotation.significance < 0.5) {
      annotation = Object.assign({}, annotation, {significance: 0.5});
      this._updateAnnotation(annotation);
      this._saveAnnotation(annotation);

      this.setState({addingToImportant: true});
      const onComplete = () => this.setState({addingToImportant: false});

      this.context.localApi.addChangeToImportant(
        this.props.page,
        this.props.from,
        this.props.to,
        annotation
      )
        .then(onComplete, onComplete);
    }
  }

  _addToDictionary (event) {
    event.preventDefault();
    if (isDisabled(event.currentTarget)) return;

    let annotation = this.state.annotation;
    if (!annotation.isDictionary) {
      annotation = Object.assign({}, annotation, {isDictionary: true});
      this._updateAnnotation(annotation);
      this._saveAnnotation(annotation);

      this.setState({addingToDictionary: true});
      const onComplete = () => this.setState({addingToDictionary: false});

      this.context.localApi.addChangeToDictionary(
        this.props.page,
        this.props.from,
        this.props.to,
        annotation
      )
        .then(onComplete, onComplete);
    }
  }

  _updateAnnotation (newAnnotation) {
    this.setState({annotation: newAnnotation});
  }

  _annotateChange (event) {
    event.preventDefault();
    this._saveAnnotation();
  }

  _saveAnnotation (annotation) {
    // TODO: display some indicator that saving is happening/complete
    annotation = annotation || this.state.annotation;
    const fromVersion = this.props.from.uuid;
    const toVersion = this.props.to.uuid;
    this.props.annotateChange(fromVersion, toVersion, annotation);
  }

  _changeSelectedVersions (from, to) {
    from = from || this.props.from;
    to = to || this.props.to;

    if (!from || !to || (this.props.from.uuid === from.uuid && this.props.to === to.uuid)) {
      return;
    }

    this.props.onChangeSelectedVersions(from, to);
  }

  _getChange (from, to) {
    from = from || this.props.from;
    to = to || this.props.to;

    this.context.api.getChange(this.props.page.uuid, from.uuid, to.uuid)
      .then(change => {
        // only update state.change if what we want is still the same
        // and we don't already have it
        if (!changeMatches(change, this.state.change) && changeMatches(change, this.props)) {
          this.setState({
            annotation: Object.assign({}, change.current_annotation),
            change
          });
        }
      });
  }
}

ChangeView.contextTypes = {
  api: PropTypes.instanceOf(WebMonitoringDb),
  localApi: PropTypes.instanceOf(WebMonitoringApi)
};

/**
 * Determine whether a change object represents the same change as another
 * change object or object with `from` and `to` properties.
 * @private
 * @param {Change} change
 * @param {Change|ChangeViewProps} other
 * @returns {boolean}
 */
function changeMatches (change, other) {
  if (!other) { return false; }
  const uuidFrom = other.from ? other.from.uuid : other.uuid_from;
  const uuidTo = other.to ? other.to.uuid : other.uuid_to;
  return change && change.uuid_from === uuidFrom && change.uuid_to === uuidTo;
}

function isDisabled (element) {
  return element.disabled || element.classList.contains('disabled');
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
