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
 */

/**
 * Display a list of pages.
 *
 * @class PageList
 * @extends {Component}
 * @param {PageListProps} props
 */
export default class PageList extends Component {
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
          onSearch={this.props.onSearch}
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
            {this.props.pages.map(page => this.renderRow(page))}
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

  renderRow (record) {
    const onClick = this.didClickRow.bind(this, record);
    const tags = removeNonUserTags(record.tags);
    const statusCode = record.status || 200;
    let statusCategory = getHttpStatusCategory(statusCode);

    return (
      <tr key={record.uuid} onClick={onClick} data-name="info-row">
        <td>{getDomain(record.url)}</td>
        <td>{record.title}</td>
        <td><a href={record.url} target="_blank" rel="noopener">{record.url}</a></td>
        <td>{tags.map(tag => <PageTag tag={tag} key={tag.name} />)}</td>
        <td
          data-status-category={statusCategory}
          data-tooltip-id="list-tooltip"
          data-tooltip-content={describeHttpStatus(statusCode)}
        >
          {statusCode >= 400 ? '✘' : '•'} {record.status}
        </td>
        <td data-page-active={record.active.toString()}>
          {record.active ? '•' : '✘'}
        </td>
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

  didClickRow (page, event) {
    const relativeUrl = `/page/${page.uuid}`;
    if (isInAnchor(event.target)) {
      return;
    }

    if (event.ctrlKey || event.metaKey) {
      window.open(relativeUrl, '_blank');
      return;
    }

    this.props.history.push(relativeUrl);
  }
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
