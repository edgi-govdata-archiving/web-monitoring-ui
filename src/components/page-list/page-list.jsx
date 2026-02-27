import { useNavigate } from 'react-router';
import { DateTime } from 'luxon';
import Loading from '../loading';
import { Component } from 'react';
import SearchBar from '../search-bar/search-bar';
import StandardTooltip from '../standard-tooltip/standard-tooltip';
import PageTag from '../page-tag/page-tag';
import {
  getHttpStatusCategory,
  describeHttpStatus
} from '../../scripts/http-info';
import { removeNonUserTags } from '../../scripts/tools';

import baseStyles from '../../css/base.css';
import listStyles from './page-list.css';

/**
 * These props also inherit from React Router's RouteComponent props
 * @typedef {Object} PageListProps
 * @property {Page[]} pages
 * @property {(any) => void} onSearch
 * @property {URLSearchParams} searchParams
 * @property {(params: URLSearchParams, options?: {replace?: boolean}) => void} setSearchParams
 */

/**
 * Display a list of pages.
 *
 * @class PageList
 * @extends {Component}
 * @param {PageListProps} props
 */
export default class PageList extends Component {
  constructor (props) {
    super(props);

    // Parse initial values from URL search params
    const urlParam = props.searchParams?.get('url') || '';
    const startDateParam = props.searchParams?.get('startDate');
    const endDateParam = props.searchParams?.get('endDate');

    this._initialUrl = urlParam;
    this._initialStartDate = startDateParam ? parseDate(startDateParam) : null;
    this._initialEndDate = endDateParam ? parseDate(endDateParam) : null;

    this._handleSearch = this._handleSearch.bind(this);
    this._updateUrlParams = debounce(this._updateUrlParams.bind(this), 500);
  }

  /**
   * Handle search from SearchBar and update URL params.
   * @param {Object} query - The search query
   */
  _handleSearch (query) {
    // Call the parent onSearch handler
    this.props.onSearch(query);

    // Update URL params (debounced)
    this._updateUrlParams(query);
  }

  /**
   * Update URL search params based on search query.
   * @param {Object} query - The search query
   */
  _updateUrlParams (query) {
    const params = new URLSearchParams();

    // Extract raw URL from expanded pattern (e.g., "*//epa*" -> "epa")
    if (query.url) {
      const rawUrl = extractRawUrl(query.url);
      if (rawUrl) {
        params.set('url', rawUrl);
      }
    }

    if (query.startDate) {
      params.set('startDate', query.startDate.toISODate());
    }

    if (query.endDate) {
      params.set('endDate', query.endDate.toISODate());
    }

    // Use replace to avoid polluting browser history
    this.props.setSearchParams(params, { replace: true });
  }

  render () {
    let results;

    if (!this.props.pages) {
      results = <Loading />;
    }
    else if (this.props.pages instanceof Error) {
      results = this.renderError(`Could not load pages: ${this.props.pages.message}`);
    }
    else if (this.props.pages.length === 0) {
      results = this.renderError('There were no page results.', 'warning');
    }
    else {
      results = this.renderPages();
    }

    return (
      <div className={baseStyles.main}>
        <SearchBar
          onSearch={this._handleSearch}
          initialUrl={this._initialUrl}
          initialStartDate={this._initialStartDate}
          initialEndDate={this._initialEndDate}
        />
        {results}
      </div>
    );
  }

  renderPages () {
    return (
      <div className={listStyles.container}>
        <StandardTooltip id="list-tooltip" />
        <table className={[listStyles.table, listStyles.pageList].join(' ')}>
          <thead>{this.renderHeader()}</thead>
          <tbody>
            {this.props.pages.map(page => (
              <PageListRow page={page} key={page.uuid} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  renderHeader () {
    return (
      <tr>
        <th data-name="domain">Domain</th>
        <th data-name="page-name">Page Name</th>
        <th data-name="url">URL</th>
        <th data-name="tags">Tags</th>
        <th data-name="status">HTTP Status</th>
        <th data-name="active">Active?</th>
      </tr>
    );
  }

  // TODO: we use similar markup elsewhere, consider making this a component
  renderError (message, type = 'danger') {
    return (
      <div className={listStyles.container}>
        <p className={[listStyles.listAlert, baseStyles.alert, baseStyles[`alert-${type}`]].join(' ')} role="alert">
          {message}
        </p>
      </div>
    );
  }
}

/**
 * React component that renders a single row in the PageList table.
 */
function PageListRow ({ page }) {
  const navigate = useNavigate();
  const detailsUrl = `/page/${page.uuid}`;
  const tags = removeNonUserTags(page.tags);
  const statusCode = page.status || 200;
  const statusCategory = getHttpStatusCategory(statusCode);

  const onClick = (event) => {
    if (isInAnchor(event.target)) {
      return;
    }

    if (event.ctrlKey || event.metaKey) {
      window.open(detailsUrl, '_blank');
      return;
    }

    navigate(detailsUrl);
  };

  return (
    <tr onClick={onClick} data-name="info-row">
      <td>{getDomain(page.url)}</td>
      <td>{page.title}</td>
      <td><a href={page.url} target="_blank" rel="noreferrer">{page.url}</a></td>
      <td>{tags.map(tag => <PageTag tag={tag} key={tag.name} />)}</td>
      <td
        data-status-category={statusCategory}
        data-tooltip-id="list-tooltip"
        data-tooltip-content={describeHttpStatus(statusCode)}
      >
        {statusCode >= 400 ? '✘' : '•'} {page.status}
      </td>
      <td data-page-active={page.active.toString()}>
        {page.active ? '•' : '✘'}
      </td>
    </tr>
  );
}

function isInAnchor (node) {
  if (!node) {
    return false;
  }
  else if (node.nodeType === 1 && node.nodeName === 'A') {
    return true;
  }
  return isInAnchor(node.parentNode);
}

const HOST_WITHOUT_WWW_PATTERN = /^[^:]+:\/\/(?:ww+\d*\.)?([^/]+)/;

function getDomain (url) {
  return url.match(HOST_WITHOUT_WWW_PATTERN)[1];
}

/**
 * Extract raw URL from expanded pattern.
 * E.g., "* //epa*" becomes "epa", "http://epa.gov*" becomes "http://epa.gov"
 * @param {string} expandedUrl - The expanded URL pattern
 * @returns {string} - The raw URL without wildcards
 */
function extractRawUrl (expandedUrl) {
  if (!expandedUrl) return '';

  let raw = expandedUrl;

  // Remove leading wildcard pattern (e.g., "*//" -> "")
  if (raw.startsWith('*//')) {
    raw = raw.slice(3);
  }

  // Remove trailing wildcard
  if (raw.endsWith('*')) {
    raw = raw.slice(0, -1);
  }

  return raw;
}

/**
 * Parse an ISO date string into a Luxon DateTime object.
 * Returns null if the string is invalid.
 * @param {string} dateStr - ISO date string (YYYY-MM-DD)
 * @returns {DateTime|null}
 */
function parseDate (dateStr) {
  if (!dateStr) return null;
  const dt = DateTime.fromISO(dateStr);
  return dt.isValid ? dt : null;
}

function debounce (func, delay) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
}
