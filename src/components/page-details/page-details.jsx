import PropTypes from 'prop-types';
import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import WebMonitoringDb from '../../services/web-monitoring-db';
import ChangeView from '../change-view/change-view';
import Loading from '../loading';
import Tooltip from 'react-tooltip';
import { escapeHtml } from '../../scripts/html-transforms';

import baseStyles from '../../css/base.css'; // eslint-disable-line
import pageStyles from './page-details.css'; // eslint-disable-line

const cutoffDate = '2000-01-01';

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
  static getDerivedStateFromProps (props, state) {
    // Clear existing content when switching pages
    if (state.page && state.page.uuid !== props.match.params.pageId) {
      return { page: null };
    }
    return null;
  }

  constructor (props) {
    super(props);
    this.state = { page: null };
    this._annotateChange = this._annotateChange.bind(this);
    this._navigateToChange = this._navigateToChange.bind(this);
  }

  componentDidMount () {
    window.addEventListener('keydown', this);
    this._loadPage(this.props.match.params.pageId);
  }

  componentWillUnmount () {
    window.removeEventListener('keydown', this);
    this.setTitle(true);
  }

  /**
   * @param {PageDetailsProps} previousProps
   */
  componentDidUpdate (previousProps) {
    this.setTitle();
    const nextPageId = this.props.match.params.pageId;
    if (nextPageId !== previousProps.match.params.pageId) {
      this._loadPage(nextPageId);
    }
  }

  setTitle (unmounting = false) {
    document.title = !unmounting && this.state.page ? `Scanner | ${this.state.page.url}` : 'Scanner';
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

    if (this.state.page.merged_into) {
      const targetId = this.state.page.merged_into;
      const changeId = this.props.match.params.change || '';
      return <Redirect to={`/page/${targetId}/${changeId}`} />;
    }

    // TODO: this HTML should probably be broken up a bit
    return (
      <div styleName="baseStyles.main pageStyles.page-details-main">
        <div styleName="pageStyles.header">
          <header styleName="pageStyles.header-section-title">
            <h2 styleName="pageStyles.page-title">
              {this.state.page.title}
            </h2>
            <PageUrlDisplay page={this.state.page} {...this._versionsToRender()} />
          </header>
          <div styleName="pageStyles.header-section-pager">
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
        <ul styleName="pageStyles.pager">
          <li>
            <Link to={previousUrl} styleName="pageStyles.pager-prev">
              <i className="fa fa-arrow-left" aria-hidden="true" /> Previous
            </Link>
          </li>
          <li>
            <Link to={nextUrl}>
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
      return <div styleName="baseStyles.alert baseStyles.alert-danger">No saved versions of this page.</div>;
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

    return { from, to, shouldRedirect };
  }

  _loadPage (pageId) {
    // TODO: handle the missing `.versions` collection problem better
    const fromList = this.props.pages && this.props.pages.find(
      (page) => page.uuid === pageId && !!page.versions);

    /** HACK: To deal with the huge number of versions coming from Internet Archive,
     * we're returning only versions captured after November 1, 2016 until we figure out a
     * better solution. Probably an improved iteration of timeline idea:
     * https://github.com/edgi-govdata-archiving/web-monitoring-ui/pull/98
     * Issue outlined here: https://github.com/edgi-govdata-archiving/web-monitoring-db/issues/264
     */
    Promise.resolve(fromList || this.context.api.getPage(pageId))
      .then(page => {
        // If we redirected to a different page ID, store a special object so
        // we can redirect on render.
        if (page.uuid !== pageId) {
          this.setState({ page: { uuid: pageId, merged_into: page.uuid } });
        }
        this._loadVersions(page, cutoffDate, '')
          .then(versions => {
            page.versions = versions;
            this.setState({ page });
          });
      });
  }

  _loadVersions (page, dateFrom, dateTo) {
    const capture_time = { 'capture_time': `${dateFrom}..${dateTo}` };
    return this.context.api.getVersions(page.uuid, capture_time, Infinity);
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

function PageUrlDisplay ({ page, from, to }) {
  const fromRedirects = _redirectHistoryForVersion(from);
  const toRedirects = _redirectHistoryForVersion(to);

  if (fromRedirects.length > 1 || toRedirects.length > 1) {
    const same = fromRedirects.length === toRedirects.length
      && fromRedirects.every((value, index) => toRedirects[index] === value);
    const target = toRedirects ? toRedirects[toRedirects.length - 1] : fromRedirects[fromRedirects.length - 1];

    let arrowType = 'angle-right';
    if (!same) {
      arrowType = 'random';
    }
    else if (fromRedirects.length > 2 || toRedirects.length > 2) {
      arrowType = 'angle-double-right';
    }

    let tooltip = '<strong>Redirects:</strong>';
    if (same) {
      tooltip += `<p>${fromRedirects.join(' →<br/>')}</p>`;
    }
    else {
      const fromHtml = fromRedirects.length > 1
        ? `<br />${fromRedirects.join(' →<br/>')}`
        : '(None)';
      tooltip += `<p><strong>From version:</strong>${fromHtml}</p>`;

      const toHtml = toRedirects.length > 1
        ? `<br />${toRedirects.join(' →<br/>')}`
        : '(None)';
      tooltip += `<p><strong>To version:</strong>${toHtml}</p>`;
    }

    return (
      <>
        <PageUrlLink url={to.url} />
        <i
          className={`fa fa-no-hover fa-right-icon fa-${arrowType}`}
          aria-hidden="true"
          data-for="redirect-tooltip"
          data-tip={tooltip}
          data-html
        />
        <PageUrlLink
          url={target || '#'}
          text={target || '(No redirect for “to” version)'}
        />
        <Tooltip
          id="redirect-tooltip"
          place="bottom"
          effect="solid"
          styleName="pageStyles.redirect-tooltip"
        />
      </>
    );
  }

  return <PageUrlLink url={page.url} />;
}

function PageUrlLink ({ url, text = null }) {
  return (
    <a href={url} target="_blank" rel="noopener" className="diff_page_url">
      {text || url}
    </a>
  );
}

/**
 * Get an array of all the URLs that were requested to get a version's body.
 * If the resulting array has length 1, there were no redirects.
 * @param {Version} version
 */
function _redirectHistoryForVersion (version) {
  if (!version) return [];

  // Make a copy of the redirects
  const redirects = (
    version.source_metadata && version.source_metadata.redirects || []
  ).slice();

  // Ensure it starts with the URL we tried to capture here.
  if (redirects[0] != version.url) {
    redirects.unshift(version.url);
  }

  // ...and ends with the final URL. Some versions include this, while others
  // have it in `source_metadata.redirected_url`.
  if (version.redirected_url && redirects[redirects.length - 1] !== version.redirected_url) {
    redirects.push(version.redirected_url);
  }

  return redirects;
}

PageDetails.contextTypes = {
  api: PropTypes.instanceOf(WebMonitoringDb)
};
