import PropTypes from 'prop-types';
import React from 'react';
import {Link, Redirect} from 'react-router-dom';
import WebMonitoringDb from '../services/web-monitoring-db';
import ChangeView from './change-view';
import Loading from './loading';

/**
 * @typedef {Object} PageDetailsProps
 * @property {Page[]} pages
 * @property {Object} user
 */

/**
 * Renders detailed, full-screen view of a page and its versions, changes, etc.
 *
 * @class PageDetails
 * @extends {React.Component}
 * @param {PageDetailsProps} props
 */
export default class PageDetails extends React.Component {
  constructor (props) {
    super(props);
    this.state = { page: null };
    this._annotateChange = this._annotateChange.bind(this);
    this._navigateToChange = this._navigateToChange.bind(this);
  }

  componentWillMount () {
    this._loadPage(this.props.match.params.pageId);
  }

  componentDidMount () {
    window.addEventListener('keydown', this);
  }

  componentWillUnmount () {
    window.removeEventListener('keydown', this);
  }

  /**
   * @param {PageDetailsProps} nextProps
   */
  componentWillReceiveProps (nextProps) {
    const nextPageId = nextProps.match.params.pageId;
    if (nextPageId !== this.props.match.params.pageId) {
      this._loadPage(nextPageId);
    }
  }

  /**
   * This is part of the DOM event handler interface
   * @private
   * @param {DOMEvent} event
   */
  handleEvent (event) {
    if (event.keyCode === 27) {
      this.props.history.push('/');
    }
  }

  /**
   * Save an annotation on a change
   *
   * @param {string} fromVersion ID of the `from` version of the change
   * @param {string} toVersion ID of the `to` version of the change
   * @param {Object} annotation
   */
  _annotateChange (fromVersion, toVersion, annotation) {
    return this.context.api.annotateChange(
      this.state.page.uuid,
      fromVersion,
      toVersion,
      annotation
    );
  }

  render () {
    if (!this.state.page) {
      return (<Loading />);
    }

    // TODO: this HTML should probably be broken up a bit
    return (
      <div className="container-fluid container-page-view">
        <div className="row">
          <div className="col-md-9">
            <header>
              <h2 className="page-title">
                {this.state.page.title}
              </h2>
              <a
                className="diff_page_url"
                href={this.state.page.url}
                target="_blank"
                rel="noopener"
              >
                {this.state.page.url}
              </a>
            </header>
          </div>
          <div className="col-md-3">
            {this._renderPager()}
          </div>
        </div>
        {this._renderChange()}
      </div>
    );
  }

  _renderPager () {
    if (!this.props.pages) {
      return null;
    }
    const allPages = this.props.pages || [];
    const index = allPages.findIndex(page => page.uuid === this.state.page.uuid);
    const previousPage = allPages[index - 1];
    const previousUrl = previousPage ? `/page/${previousPage.uuid}` : '#';
    const nextPage = index >= 0 ? allPages[index + 1] : null;
    const nextUrl = nextPage ? `/page/${nextPage.uuid}` : '#';

    return (
      <nav aria-label="...">
        <ul className="pager">
          <li>
            <Link to={previousUrl} className="pager__previous">
              <i className="fa fa-arrow-left" aria-hidden="true" /> Previous
            </Link>
          </li>
          <li>
            <Link to={nextUrl} className="pager__next">
              Next <i className="fa fa-arrow-right" aria-hidden="true" />
            </Link>
          </li>
        </ul>
      </nav>
    );
  }

  /**
   * When possible, render the appropriate ChangeView. Otherwise:
   * - Redirect to a URL specifying a valid change (if there wasn't one)
   * - Render a message indicating no change to render (if there's no
   *   valid change we could navigate to)
   * @private
   * @returns {JSX.Element}
   */
  _renderChange () {
    /** TODO: should we show 404 for bad versions? */
    const versionData = this._versionsToRender();

    if (versionData.shouldRedirect && versionData.from && versionData.to) {
      return <Redirect to={this._getChangeUrl(versionData.from, versionData.to)} />;
    }
    else if (!(versionData.from && versionData.to)) {
      return <div className="alert alert-danger">No saved versions of this page.</div>;
    }

    return (
      <ChangeView
        from={versionData.from}
        to={versionData.to}
        page={this.state.page}
        annotateChange={this._annotateChange}
        user={this.props.user}
        onChangeSelectedVersions={this._navigateToChange}
      />
    );
  }

  /**
   * Return `from` and `to` versions to display based on uuids in url.
   * There are various shortcuts that can be used when both uuids are not provided.
   *
   * 1) `from..`    - `from` and its next version
   * 2) `..to`      - `to` and its previous version
   * 3) `^..(to)`   - the first version and its next version or `to`
   * 4) `(from)..$` - the latest version and its previous version or `from`
   *
   * The default is to return the latest version and its previous version.
   * @private
   * @returns {Object}
   */
  _versionsToRender () {
    const [fromId, toId] = (this.props.match.params.change || '').split('..');
    const versions = this.state.page.versions;
    let from, to, shouldRedirect = false;

    from = versions.find(v => v.uuid === fromId);
    to = versions.find(v => v.uuid === toId);

    if (!(from && to)) {
      shouldRedirect = true;

      /**
       * We try to determine `to` first because the default case
       * sets `to` to latest version, then `from` based on that.
       *
       * Check for regex operators, if not found
       * set version to found version, relative version, or default.
       */
      if (toId === '$') {
        to = versions[0];
      }
      else {
        to = to || versions[versions.indexOf(from) - 1] || versions[0];
      }

      if (fromId === '^') {
        from = versions[versions.length - 1];

        // make `^..` go to first and next, instead of first and latest version
        if (!toId) {
          to = versions[versions.indexOf(from) - 1];
        }
      }
      else {
        from = from || versions[versions.indexOf(to) + 1] || to;
      }
    }

    return {from, to, shouldRedirect};
  }

  _loadPage (pageId) {
    // TODO: handle the missing `.versions` collection problem better
    const fromList = this.props.pages && this.props.pages.find(
      (page) => page.uuid === pageId && !!page.versions);

    Promise.resolve(fromList || this.context.api.getPage(pageId))
      .then((page) => {
        this.setState({page});
      });
  }

  _getChangeUrl (from, to, page) {
    const changeId = (from && to) ? `${from.uuid}..${to.uuid}` : '';
    const pageId = page && page.uuid || this.props.match.params.pageId;
    return `/page/${pageId}/${changeId}`;
  }

  _navigateToChange (from, to, page, replace = false) {
    const url = this._getChangeUrl(from, to, page);
    this.props.history[replace ? 'replace' : 'push'](url);
  }
}

PageDetails.contextTypes = {
  api: PropTypes.instanceOf(WebMonitoringDb)
};
