import AnnotationForm from '../annotation-form';
import DiffSettingsForm from '../diff-settings-form';
import { diffTypesFor } from '../../constants/diff-types';
import DiffView from '../diff-view';
import layeredStorage from '../../scripts/layered-storage';
import Loading from '../loading';
import { Component } from 'react';
import SelectDiffType from '../select-diff-type';
import SelectVersion from '../select-version';
import SourceInfo from '../source-info/source-info';
import { ApiContext } from '../api-context';
import {
  htmlType,
  mediaTypeForExtension,
  parseMediaType,
  unknownType
} from '../../scripts/media-type';

import baseStyles from '../../css/base.css';
import viewStyles from './change-view.css';

export const defaultDiffType = 'SIDE_BY_SIDE_RENDERED';
export const defaultFilePreviewDiffType = 'SIDE_BY_SIDE_FILE_PREVIEW';
export const diffTypeStorage = 'edgi.wm.ui.diff_type';

const collapsedViewStorage = 'WebMonitoring.ChangeView.collapsedView';
const diffSettingsStorage = 'edgi.wm.ui.diff_settings';

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
 * @extends {Component}
 * @param {ChangeViewProps} props
 */
export default class ChangeView extends Component {
  static contextType = ApiContext;

  static getDerivedStateFromProps (props, state) {
    // Ensure that the current diff type is relevant to the content we are
    // comparing. If not, switch to a relevant type.
    if (props.from && props.to) {
      const diffType = ensureValidDiffType(props.from, props.to, props.page, state.diffType);
      if (diffType !== state.diffType) return { diffType };
    }

    return null;
  }

  get userCanAnnotate () {
    return this.props.user?.permissions?.includes('annotate') ?? false;
  }

  constructor (props) {
    super(props);

    this.state = {
      addingToDictionary: false,
      addingToImportant: false,
      annotation: {},
      change: null,
      collapsedView: loadCollapsedView(),
      diffSettings: loadDiffSettings(),
      diffType: undefined,
      updating: false,
    };

    this.currentlyLoadingChange = null;

    this.handleFromVersionChange = this.handleFromVersionChange.bind(this);
    this.handleToVersionChange = this.handleToVersionChange.bind(this);
    this.handleDiffTypeChange = this.handleDiffTypeChange.bind(this);
    this.handleDiffSettingsChange = this.handleDiffSettingsChange.bind(this);
    this._toggleCollapsedView = this._toggleCollapsedView.bind(this);
    this._annotateChange = this._annotateChange.bind(this);
    this._updateAnnotation = this._updateAnnotation.bind(this);
    this._markAsSignificant = this._markAsSignificant.bind(this);
    this._addToDictionary = this._addToDictionary.bind(this);
  }

  componentDidMount () {
    if (this.userCanAnnotate) {
      this._getChange();
    }
  }

  componentWillUnmount () {
    this.currentlyLoadingChange = null;
  }

  componentDidUpdate (previousProps) {
    if (
      this.userCanAnnotate
      && (this.props.from !== previousProps.from || this.props.to !== previousProps.to)
    ) {
      this._getChange(this.props.from, this.props.to);
    }

    saveCollapsedView(this.state.collapsedView);
  }

  handleDiffTypeChange (diffType) {
    this.setState({ diffType });
    saveDiffType(diffType);
  }

  handleDiffSettingsChange (diffSettings) {
    this.setState({ diffSettings });
    if (diffSettings) {
      saveDiffSettings(diffSettings);
    }
  }

  handleFromVersionChange (version) {
    this._changeSelectedVersions(version, null);
  }

  handleToVersionChange (version) {
    this._changeSelectedVersions(null, version);
  }

  render () {
    const { page } = this.props;
    if (!page || !page.versions) {
      // if haz no page, don't render
      return (<div></div>);
    }

    return (
      <div className={viewStyles.changeView}>
        {this.userCanAnnotate ? this.renderSubmission() : null}
        <div className="utilities">
          <SourceInfo
            from={this.props.from}
            to={this.props.to}
            pageUrl={this.props.page.url}
          />
          <DiffSettingsForm
            settings={this.state.diffSettings}
            diffType={this.state.diffType}
            onChange={this.handleDiffSettingsChange}
          />
        </div>
        {this.renderVersionSelector(page)}
        <DiffView page={page} diffType={this.state.diffType} a={this.props.from} b={this.props.to}
          diffSettings={this.state.diffSettings}/>
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
          <SelectDiffType
            types={relevantDiffTypes(this.props.from, this.props.to, this.props.page)}
            value={this.state.diffType}
            onChange={this.handleDiffTypeChange}
          />
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

    if (this.state.updating) {
      return <Loading />;
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
            disabled={this.state.addingToImportant}
            onClick={this._markAsSignificant}
            className={[baseStyles.btn, baseStyles.btnLink, viewStyles.actionBtn].join(' ')}
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
            disabled={this.state.addingToDictionary}
            onClick={this._addToDictionary}
            className={[baseStyles.btn, baseStyles.btnLink, viewStyles.actionBtn].join(' ')}
          >
            Add to Dictionary
          </button>
        </span>
      );
    }

    // Returning array of controls so that we don't have an extraneous containing div
    return [
      (
        <div className={viewStyles.actions} key="change-view-actions">
          <div className={viewStyles.actionsSection}>
            <i className="fa fa-toggle-on" aria-hidden="true" />
            {/* TODO: should be buttons */}
            <a className="lnk-action" href="#" onClick={this._toggleCollapsedView}>Toggle Signifiers</a>
            <i className="fa fa-pencil" aria-hidden="true" />
            <a className="lnk-action" href="#" onClick={this._annotateChange}>Update Record</a>
          </div>
          <div className={viewStyles.actionsSection}>
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
    this.setState(previousState => ({ collapsedView: !previousState.collapsedView }));
  }

  _markAsSignificant (event) {
    event.preventDefault();
    if (isDisabled(event.currentTarget)) return;

    let annotation = this.state.annotation;
    if (!annotation.significance || annotation.significance < 0.5) {
      annotation = Object.assign({}, annotation, { significance: 0.5 });
      this._updateAnnotation(annotation);
      this._saveAnnotation(annotation);

      this.setState({ addingToImportant: true });
      const onComplete = () => this.setState({ addingToImportant: false });

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
      annotation = Object.assign({}, annotation, { isDictionary: true });
      this._updateAnnotation(annotation);
      this._saveAnnotation(annotation);

      this.setState({ addingToDictionary: true });
      const onComplete = () => this.setState({ addingToDictionary: false });

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
    this.setState({ annotation: newAnnotation });
  }

  _annotateChange (event) {
    event.preventDefault();
    this._saveAnnotation();
  }

  _saveAnnotation (annotation) {
    this.setState({ updating: true });
    annotation = annotation || this.state.annotation;
    const fromVersion = this.props.from.uuid;
    const toVersion = this.props.to.uuid;
    this.props.annotateChange(fromVersion, toVersion, annotation)
      .then(() => this.setState({ updating: false }));
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

    this.currentlyLoadingChange = { from, to };
    this.context.api.getChange(this.props.page.uuid, from.uuid, to.uuid)
      .then(change => {
        // only update state.change if what we want is still the same
        // and we don't already have it
        if (!changeMatches(change, this.state.change) && changeMatches(change, this.currentlyLoadingChange)) {
          this.setState({
            annotation: Object.assign({}, change.current_annotation),
            change
          });
        }
      });
  }
}

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

function relevantDiffTypes (versionA, versionB, page) {
  let typeA = mediaTypeForVersion(versionA, page);

  if (typeA.equals(mediaTypeForVersion(versionB, page))) {
    return diffTypesFor(typeA);
  }

  // If we have differing types of content consider it an 'unkown' type.
  return diffTypesFor(unknownType);
}

// Matches the file extension on a URL
const extensionExpression = /^([^:]+:\/\/)?.*\/[^/]*(\.[^/]+)$/;

function mediaTypeForVersion (version, page) {
  if (version.media_type) {
    return parseMediaType(version.media_type);
  }

  const extensionType = mediaTypeForUrl(version.body_url)
    || (page && mediaTypeForUrl(page.url));

  return extensionType || htmlType;
}

function mediaTypeForUrl (url) {
  const extension = url ? url.match(extensionExpression) : null;
  return extension && mediaTypeForExtension[extension[2]];
}

function loadCollapsedView () {
  // defaults to true if storage is not set
  return layeredStorage.getItem(collapsedViewStorage) !== false;
}

function saveCollapsedView (collapsedView) {
  layeredStorage.setItem(collapsedViewStorage, collapsedView);
}

function loadDiffSettings () {
  return layeredStorage.getItem(diffSettingsStorage) || {
    removeFormatting: false,
    useWaybackResources: true,
    syncScrolling: true,
  };
}

function saveDiffSettings (settings) {
  layeredStorage.setItem(diffSettingsStorage, settings);
}

function ensureValidDiffType (from, to, page, stateDiffType = null) {
  const relevantTypes = relevantDiffTypes(from, to, page);

  // Determine the appropriate default based on content type
  const isNonRenderable = relevantTypes.some(type =>
    type.value === 'FILE_PREVIEW' || type.value === 'SIDE_BY_SIDE_FILE_PREVIEW'
  );
  const appropriateDefault = isNonRenderable ? defaultFilePreviewDiffType : defaultDiffType;

  const typesToTry = ([stateDiffType, loadDiffType(), appropriateDefault]).filter(t => t);

  return typesToTry.find(diffType => isDiffTypeRelevant(relevantTypes, diffType))
    || relevantTypes[0].value;
}

function isDiffTypeRelevant (relevantTypes, diffType) {
  return relevantTypes.some((type) => type.value === diffType);
}

function loadDiffType () {
  return layeredStorage.getItem(diffTypeStorage);
}

function saveDiffType (diffType) {
  layeredStorage.setItem(diffTypeStorage, diffType);
}
