import {dateFormatter} from '../scripts/formatters';
import React from 'react';
import Loading from './loading';

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
  constructor (props) {
    super(props);
    this._didSearch = this._didSearch.bind(this);
    this._dispatchSearch = debounce(this._dispatchSearch.bind(this), 500);
  }

  render () {
    if (!this.props.pages) {
      return <Loading />;
    }

    return (
      <div className="container-fluid container-list-view">
        <div className="row search-bar">
          <input
            type="text"
            placeholder="Search for a URL..."
            onChange={this._didSearch}
          />
        </div>
        <div className="row">
          <div className="col-md-12">
            <table className="page-list table">
              <thead>
                {this.renderHeader()}
              </thead>
              <tbody>
                {this.props.pages.map(page => this.renderRow(page))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  renderHeader () {
    return (
      <tr>
        <th data-name="capture-date">Capture Date</th>
        <th data-name="site">Site</th>
        <th data-name="page-name">Page Name</th>
        <th data-name="url">URL</th>
      </tr>
    );
  }

  renderRow (record) {
    const onClick = this.didClickRow.bind(this, record);

    // TODO: click handling
    return (
      <tr key={record.uuid} onClick={onClick}>
        <td>{dateFormatter.format(record.latest.capture_time)}</td>
        <td>{record.site}</td>
        <td>{record.title}</td>
        <td><a href={record.url} target="_blank" rel="noopener">{record.url}</a></td>
      </tr>
    );
  }

  didClickRow (page, event) {
    if (isInAnchor(event.target)) {
      return;
    }

    this.props.history.push(`/page/${page.uuid}`);
  }

  _didSearch (event) {
    this._dispatchSearch(event.target.value);
  }

  _dispatchSearch (url) {
    if (url) {
      // If doesn't start with a protocol (or looks like it's going that way),
      // prefix with an asterisk.
      if (!/^(\*|\/\/|(h|ht|htt|https?|https?\/|https?\/\/))/.test(url)) {
        url = url = `*//${url}`;
      }
      // If the search is for a domain + TLD, return all paths under it
      if (/^[\w:*]+(\/\/)?[^/]+$/.test(url)) {
        url = `${url}*`;
      }
    }
    if (this.props.onSearch) {
      const query = url ? {url} : null;
      this.props.onSearch(query);
    }
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

function debounce (func, delay) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
}
