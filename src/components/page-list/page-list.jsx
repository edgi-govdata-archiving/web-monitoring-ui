import Loading from '../loading';
import React from 'react';
import SearchBar from '../search-bar/search-bar';

import baseStyles from '../../css/base.css'; // eslint-disable-line
import listStyles from './page-list.css'; // eslint-disable-line

const IGNORED_TAG_PREFIXES = ['site:', '2l-domain:', 'domain:'];

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
 * @extends {React.Component}
 * @param {PageListProps} props
 */
export default class PageList extends React.Component {
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
      <div styleName="baseStyles.main">
        <SearchBar
          onSearch={this.props.onSearch}
        />
        {results}
      </div>
    );
  }

  renderPages () {
    return (
      <div styleName="listStyles.container">
        <table styleName="listStyles.table listStyles.page-list">
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
      </tr>
    );
  }

  renderRow (record) {
    const onClick = this.didClickRow.bind(this, record);
    const tags = record.tags.filter(tag =>
      !IGNORED_TAG_PREFIXES.some(prefix => tag.name.startsWith(prefix))
    );

    return (
      <tr key={record.uuid} onClick={onClick} data-name="info-row">
        <td>{getDomain(record.url)}</td>
        <td>{record.title}</td>
        <td><a href={record.url} target="_blank" rel="noopener">{record.url}</a></td>
        <td>{tags.map(tag => <PageTag tag={tag} key="tag.name" />)}</td>
      </tr>
    );
  }

  // TODO: we use similar markup elsewhere, consider making this a component
  renderError (message, type = 'danger') {
    return (
      <div styleName="listStyles.container">
        <p styleName={`listStyles.list-alert baseStyles.alert baseStyles.alert-${type}`} role="alert">
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

/**
 * Helper component for rendering tags.
 */
function PageTag ({ tag }) {
  let prefix = '';
  let name = tag.name;
  const colonIndex = name.indexOf(':');
  if (colonIndex > -1) {
    prefix = name.slice(0, colonIndex + 1);
    name = name.slice(colonIndex + 1);
  }

  let prefixNode;
  if (prefix) {
    prefixNode = <span styleName="listStyles.page-tag--prefix">{prefix}</span>;
  }

  return (
    <span styleName="listStyles.page-tag">
      {prefixNode}
      {name}
    </span>
  );
}
