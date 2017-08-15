import PropTypes from 'prop-types';
import React from 'react';
import WebMonitoringDb from '../services/web-monitoring-db';
import {diffTypes, changeDiffTypes} from '../constants/diff-types';

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
    this.state = {diff: null};
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
    const { a, b, diffType } = this.props;
    const { diff } = this.state;

    if (!diffType || !diffTypes[diffType] || !diff) {
      return null;
    }

    // TODO: if we have multiple ways to render content from a single service
    // in the future (e.g. inline vs. side-by-side text), we need a better
    // way to ensure we use the correct rendering and avoid race conditions
    switch (diffType) {
    case "SIDE_BY_SIDE_RENDERED":
      return (
        <SideBySideRenderedDiff a={a} b={b} page={this.props.page} />
      );
    case "HIGHLIGHTED_TEXT":
      return (
        <HighlightedTextDiff diff={diff} className="diff-text-inline" />
      );
    case "HIGHLIGHTED_SOURCE":
      return (
        <HighlightedTextDiff diff={diff} className="diff-source-inline" />
      );
    case "CHANGES_ONLY_TEXT":
      return (
        <ChangesOnlyDiff diff={diff} className="diff-text-inline" />
      );
    case "CHANGES_ONLY_SOURCE":
      return (
        <ChangesOnlyDiff diff={diff} className="diff-source-inline" />
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

    Promise.resolve(this.context.api.getDiff(pageId, aId, bId, changeDiffTypes[diffTypes[diffType]]))
      .then((diff) => {
        this.setState({diff});
      });
  }
}

DiffView.contextTypes = {
  api: PropTypes.instanceOf(WebMonitoringDb),
};
