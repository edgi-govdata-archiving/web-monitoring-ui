import PropTypes from 'prop-types';
import React from 'react';
import WebMonitoringDb from '../services/web-monitoring-db';
import {diffTypes} from '../constants/diff-types';
import Loading from './loading';

import HighlightedTextDiff from './highlighted-text-diff';
import SideBySideRenderedDiff from './side-by-side-rendered-diff';
import ChangesOnlyDiff from './changes-only-diff';

/**
 * @typedef DiffViewProps
 * @property {Page} page
 * @property {string} diffType
 * @property {Version} a
 * @property {Version} b
 */

/**
 * Fetches and renders all sorts of diffs between two versions (props a and b)
 *
 * @class DiffView
 * @extends {React.Component}
 * @param {DiffViewProps} props
 */
export default class DiffView extends React.Component {
  constructor (props) {
    super(props);
    this.state = {diff: null, loadDiffType: null};
  }

  componentWillMount () {
    const { props } = this;
    if (this._canFetch(props)){
      this._loadDiff(props.page.uuid, props.a.uuid, props.b.uuid, props.diffType);
    }
  }

  /**
   * @param {DiffViewProps} nextProps
   */
  componentWillReceiveProps (nextProps) {
    if (this._canFetch(nextProps) && !this._propsSpecifySameDiff(nextProps)) {
      this._loadDiff(nextProps.page.uuid, nextProps.a.uuid, nextProps.b.uuid, nextProps.diffType);
    }
  }

  render () {
    const { a, b } = this.props;
    const chosenDiffType = this.props.diffType;
    const { diff, loadDiffType } = this.state;

    if (chosenDiffType && diffTypes[chosenDiffType].diffService === 'TODO') {
      return <div>No diff for '{diffTypes[chosenDiffType].description}' yet</div>;
    }

    if (!loadDiffType ||
        !diff ||
        loadDiffType !== this.props.diffType)
    {
      return <Loading />;
    }

    // TODO: if we have multiple ways to render content from a single service
    // in the future (e.g. inline vs. side-by-side text), we need a better
    // way to ensure we use the correct rendering and avoid race conditions
    switch (loadDiffType) {
    case diffTypes.SIDE_BY_SIDE_RENDERED.value:
      return (
        <SideBySideRenderedDiff a={a} b={b} page={this.props.page} />
      );
    case diffTypes.HIGHLIGHTED_TEXT.value:
      return (
        <HighlightedTextDiff diff={diff} className='diff-text-inline' />
      );
    case diffTypes.HIGHLIGHTED_SOURCE.value:
      return (
        <HighlightedTextDiff diff={diff} className='diff-source-inline' />
      );
    case diffTypes.CHANGES_ONLY_TEXT.value:
      return (
        <ChangesOnlyDiff diff={diff} className='diff-text-inline' />
      );
    case diffTypes.CHANGES_ONLY_SOURCE.value:
      return (
        <ChangesOnlyDiff diff={diff} className='diff-source-inline' />
      );
    default:
      return null;
    }
  }

  /**
   * Determine whether a set of props specifies the same diff as another set of
   * props (or the current props, if omitted).
   *
   * @private
   * @param {DiffViewProps} newProps The new props to check
   * @param {DiffViewProps} [props=this.props] The current props to compare to
   * @returns {boolean}
   */
  _propsSpecifySameDiff (newProps, props) {
    props = props || this.props;
    return props.a.uuid === newProps.a.uuid
        && props.b.uuid === newProps.b.uuid
        && props.diffType === newProps.diffType;
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

  _loadDiff (pageId, aId, bId, diffType) {
    // TODO - this seems to be some sort of caching mechanism, would be smart to have this for diffs
    // const fromList = this.props.pages && this.props.pages.find(
    //     (page: Page) => page.uuid === pageId);
    // Promise.resolve(fromList || this.context.api.getDiff(pageId, aId, bId, changeDiffTypes[diffType]))

    this.context.api.getDiff(pageId, aId, bId, diffTypes[diffType].diffService)
      .then((diff) => {
        this.setState({
          diff: diff,
          loadDiffType: diffType
        });
      });
  }
}

DiffView.contextTypes = {
  api: PropTypes.instanceOf(WebMonitoringDb),
};
