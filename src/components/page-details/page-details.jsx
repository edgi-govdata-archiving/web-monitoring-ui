import PropTypes from 'prop-types';
import { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import WebMonitoringDb from '../../services/web-monitoring-db';
import ChangeView from '../change-view/change-view';
import Loading from '../loading';
import ExternalLink from '../external-link';
import PageUrlDetails from '../page-url-details/page-url-details';
import PageTag from '../page-tag/page-tag';
import StandardTooltip from '../standard-tooltip';
import { describeHttpStatus } from '../../scripts/http-info';
import { removeNonUserTags } from '../../scripts/tools';

import baseStyles from '../../css/base.css'; // eslint-disable-line
import pageStyles from './page-details.css'; // eslint-disable-line

/**
 * @typedef {Object} PageDetailsProps
 * @property {Page[]} pages
 * @property {Object} user
 */

/**
 * Renders detailed, full-screen view of a page and its versions, changes, etc.
 *
 * @class PageDetails
 * @extends {Component}
 * @param {PageDetailsProps} props
 */
export default class PageDetails extends Component {
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
    if (this.state.error) {
      return (
        <div styleName="baseStyles.main pageStyles.page-details-main">
          <p styleName="baseStyles.alert baseStyles.alert-danger" role="alert">
            Error: {this.state.error.message}
          </p>
        </div>
      );
    }

    if (!this.state.page) {
      return (<Loading />);
    }

    if (this.state.page.merged_into) {
      const targetId = this.state.page.merged_into;
      const changeId = this.props.match.params.change || '';
      return <Redirect to={`/page/${targetId}/${changeId}`} />;
    }

    const statusCode = this.state.page.status || 200;
    const statusError = statusCode >= 400;
    const tags = removeNonUserTags(this.state.page.tags);

    // TODO: this HTML should probably be broken up a bit
    return (
      <div styleName="baseStyles.main pageStyles.page-details-main">
        <StandardTooltip id="page-tooltip" />
        <div styleName="pageStyles.header">
          <header styleName="pageStyles.header-section-title">
            <h2 styleName="pageStyles.page-title">
              {this.state.page.title}
            </h2>
            {' '}
            <div styleName="pageStyles.info-items">
              <span
                styleName="pageStyles.info-item"
                data-page-active={this.state.page.active.toString()}
              >
                {this.state.page.active ? '•' : '✘ Not'} Actively Monitored
              </span>
              <span
                styleName={`pageStyles.info-item pageStyles.${statusError ? 'status-error' : 'status-ok'}`}
                data-http-status={statusCode}
                data-for="page-tooltip"
                data-tip={describeHttpStatus(statusCode)}
              >
                {statusError ? '✘' : '•'} HTTP Status: {statusCode}
              </span>
              {tags.map(tag => <PageTag tag={tag} key={tag.name} />)}
            </div>
            {/* TODO: can we restructure to remove this div? */}
            <div>
              <ExternalLink href={this.state.page.url} />
              <PageUrlDetails page={this.state.page} {...this._versionsToRender()} />
            </div>
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

    let targetUrl = null;
    if (versionData.shouldRedirect && versionData.from && versionData.to) {
      targetUrl = this._getChangeUrl(versionData.from, versionData.to);
    }

    if (this.state.versionError) {
      let message = this.state.versionError.message;
      if (!/[!.]$/.test(message)) {
        message += '.';
      }

      return (
        <div styleName="baseStyles.alert baseStyles.alert-danger">
          {message}
          {targetUrl ? (<span> <a href={targetUrl}>See supported versions.</a></span>) : ''}
        </div>
      );
    }
    else if (targetUrl) {
      return <Redirect to={targetUrl} />;
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
   * Get the `from` and `to` version IDs specified in the props/URL.
   * @private
   * @returns {[string|null, string|null]}
   */
  _versionIdsFromProps () {
    return (this.props.match.params.change || '').split('..');
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
    const [fromId, toId] = this._versionIdsFromProps();
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

    this.setState({
      error: null,
      versionError: null,
      page: fromList === this.state.page ? fromList : null
    });

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
        return this._loadVersions(page, ...this._versionIdsFromProps())
          .then(({ versions, error }) => {
            page.versions = versions;
            this.setState({ page, versionError: error });
          });
      })
      .catch(error => {
        this.setState({ error });
      });
  }

  _loadVersions (page, fromId = null, toId = null) {
    // TODO: This simply returns the sampled versions, but it might be nice to
    // show how many versions were elided (`sample.version_count`).
    return this.context.api.sampleVersions(page.uuid, Infinity)
      .then(versions => versions.map(sample => sample.version))
      .then(versions => {
        // If the specific versions we need aren't in the sample, load them and
        // merge them into the list of samples.
        const extraLoads = [];
        if (fromId && !versions.some(v => v.uuid === fromId)) {
          extraLoads.push(this.context.api.getVersion(fromId));
        }
        if (toId && !versions.some(v => v.uuid === toId)) {
          extraLoads.push(this.context.api.getVersion(toId));
        }
        return Promise.all(extraLoads)
          .then((extraVersions) => {
            versions.push(...extraVersions);
            versions.sort((a, b) => b.capture_time - a.capture_time);
            return { versions, error: null };
          })
          .catch((error) => {
            return { versions, error };
          });
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
