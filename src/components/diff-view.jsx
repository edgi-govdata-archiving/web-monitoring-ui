import { Component } from 'react';
import { ApiContext } from './api-context';
import { diffTypes } from '../constants/diff-types';
import Loading from './loading';

import HighlightedTextDiff from './highlighted-text-diff';
import InlineRenderedDiff from './inline-rendered-diff';
import SideBySideRenderedDiff from './side-by-side-rendered-diff';
import ChangesOnlyDiff from './changes-only-diff';
import RawVersion from './raw-version';
import SideBySideRawVersions from './side-by-side-raw-versions';
import FilePreview from './file-preview';
import SideBySideFilePreview from './side-by-side-file-preview';

import styles from '../css/base.css';

/**
 * @typedef DiffViewProps
 * @property {Page} page
 * @property {string} diffType
 * @property {Version} a
 * @property {Version} b
 * @property {object} diffSettings
 */

/**
 * Fetches and renders all sorts of diffs between two versions (props a and b)
 *
 * @class DiffView
 * @extends {Component}
 * @param {DiffViewProps} props
 */
export default class DiffView extends Component {
  static contextType = ApiContext;

  // Tracks the diff that was most recently requested for loading. Prevents
  // repeated calls causing multiple loads of the same data, and ensures that
  // results only for the most recent diff is used (so if the diff props are
  // changed while the component is loading, the data from the previous load
  // will be discarded because it no longer matches `_loadingDiff`).
  _loadingDiff = null;

  state = {
    // Will be requested via the API based on props.
    diffData: null,
    // Tracks previous diff-related props so that we know only to reload data
    // if props related to the diff API call have changed.
    previousDiff: null,
  };

  static getDerivedStateFromProps (props, state) {
    // Clear out stale diff data before trying to render
    if (!specifiesSameDiff(props, state.previousDiff)) {
      return {
        diffData: null,
        previousDiff: { a: props.a, b: props.b, diffType: props.diffType }
      };
    }
    return null;
  }

  componentDidMount () {
    this._loadDiffIfNeeded(this.props);
  }

  componentWillUnmount () {
    // Ensure any in-flight API calls are discarded and do not update state.
    this._loadingDiff = null;
  }

  componentDidUpdate () {
    this._loadDiffIfNeeded(this.props);
  }

  _loadDiffIfNeeded (props) {
    if (!this.state.diffData && this._canFetch(props)) {
      this._loadDiffData(props.page, props.a, props.b, props.diffType);
    }
  }

  render () {
    if (!this.state.diffData) {
      return <Loading />;
    }
    else if (this.state.diffData instanceof Error) {
      return (
        <p className={[styles.alert, styles.alertDanger].join(' ')} role="alert">
          Error: {this.state.diffData.message}
        </p>
      );
    }

    return (
      <div className="diff-view">
        {this.renderNoChangeMessage() || this.renderUndiffableMessage()}
        {this.renderDiff()}
      </div>
    );
  }

  renderNoChangeMessage () {
    const sameContent = this.props.a
      && this.props.b
      && this.props.a.body_hash === this.props.b.body_hash;

    const className = `diff-view__alert ${styles.alert} ${styles.alertWarning}`;

    if (sameContent) {
      return <div className={className} role="alert">
        These two versions are <strong>exactly the same</strong>.
      </div>;
    }
    else if (this.state.diffData.change_count === 0) {
      return <div className={className} role="alert">
        There were <strong>no changes for this diff type</strong>. (Other diff
        types may show changes.)
      </div>;
    }

    return null;
  }

  renderUndiffableMessage () {
    if (this.state.diffData.raw) {
      return (
        <div className={`diff-view__alert ${styles.alert} ${styles.alertInfo}`}>
          We can’t compare the selected versions of page; you are viewing the
          content without deletions and insertions highlighted.
        </div>
      );
    }
    return null;
  }

  renderDiff () {
    const commonProps = {
      page: this.props.page,
      a: this.props.a,
      b: this.props.b,
      diffData: this.state.diffData
    };
    // TODO: if we have multiple ways to render content from a single service
    // in the future (e.g. inline vs. side-by-side text), we need a better
    // way to ensure we use the correct rendering and avoid race conditions
    switch (this.props.diffType) {
      case diffTypes.RAW_SIDE_BY_SIDE.value:
        return (
          <SideBySideRawVersions {...commonProps} />
        );
      case diffTypes.RAW_FROM_CONTENT.value:
        return (
          <RawVersion page={this.props.page} version={this.props.a} content={this.state.diffData.rawA} />
        );
      case diffTypes.RAW_TO_CONTENT.value:
        return (
          <RawVersion page={this.props.page} version={this.props.b} content={this.state.diffData.rawB} />
        );
      case diffTypes.HIGHLIGHTED_RENDERED.value:
        return (
          <InlineRenderedDiff {...commonProps}
            removeFormatting={this.props.diffSettings.removeFormatting}
            useWaybackResources={this.props.diffSettings.useWaybackResources} />
        );
      case diffTypes.SIDE_BY_SIDE_RENDERED.value:
        return (
          <SideBySideRenderedDiff {...commonProps}
            removeFormatting={this.props.diffSettings.removeFormatting}
            useWaybackResources={this.props.diffSettings.useWaybackResources}
            syncScrolling={this.props.diffSettings.syncScrolling} />
        );
      case diffTypes.OUTGOING_LINKS.value:
        return (
          <InlineRenderedDiff {...commonProps} />
        );
      case diffTypes.HIGHLIGHTED_TEXT.value:
        return (
          <HighlightedTextDiff diffData={this.state.diffData} className='diff-text-inline' />
        );
      case diffTypes.HIGHLIGHTED_SOURCE.value:
        return (
          <HighlightedTextDiff diffData={this.state.diffData} className='diff-source-inline' />
        );
      case diffTypes.CHANGES_ONLY_TEXT.value:
        return (
          <ChangesOnlyDiff diffData={this.state.diffData} className='diff-text-inline' />
        );
      case diffTypes.CHANGES_ONLY_SOURCE.value:
        return (
          <ChangesOnlyDiff diffData={this.state.diffData} className='diff-source-inline' />
        );
      case diffTypes.FILE_PREVIEW.value:
        return (
          <FilePreview page={this.props.page} version={this.props.b} content={this.state.diffData.rawB} />
        );
      case diffTypes.SIDE_BY_SIDE_FILE_PREVIEW.value:
        return (
          <SideBySideFilePreview {...commonProps} />
        );
      default:
        return null;
    }
  }

  /**
   * Check whether this props object has everything needed to perform a fetch
   * @private
   * @param {DiffViewProps} props
   * @returns  {boolean}
   */
  _canFetch (props) {
    return (props.page.uuid && props.diffType && props.a && props.b && props.a.uuid && props.b.uuid);
  }

  _loadDiffData (page, a, b, diffType) {
    // If this diff request is already in flight, just stop now.
    const specifier = { a, b, diffType };
    if (specifiesSameDiff(specifier, this._loadingDiff)) {
      return;
    }

    this._loadingDiff = specifier;
    let dataLoad;
    if (diffTypes[diffType].diffService) {
      dataLoad = this.context.api.getDiff(
        page.uuid,
        a.uuid,
        b.uuid,
        diffTypes[diffType].diffService,
        diffTypes[diffType].options
      );
    }
    else {
      dataLoad = Promise.all([
        fetch(a.body_url, { mode: 'cors' }),
        fetch(b.body_url, { mode: 'cors' })
      ]);
    }

    dataLoad
      .catch(error => error)
      .then(data => {
        if (this._loadingDiff === specifier) {
          this.setState({ diffData: data });
        }
      });
  }
}

/**
 * Determine whether a set of props specifies the same diff as another set of
 * props.
 *
 * @private
 * @param {DiffViewProps} specifierA
 * @param {DiffViewProps} specifierB
 * @returns {boolean}
 */
function specifiesSameDiff (specifierA, specifierB) {
  return specifierA && specifierB
    && specifierA.a.uuid === specifierB.a.uuid
    && specifierA.b.uuid === specifierB.b.uuid
    && specifierA.diffType === specifierB.diffType;
}
