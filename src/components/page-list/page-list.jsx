import {dateFormatter, formatSites} from '../../scripts/formatters';
import Loading from '../loading';
import React from 'react';
import SearchBar from '../search-bar/search-bar';
import './page-list.css';
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
    if (!this.props.pages) {
      return <Loading />;
    }

    let results;

    if (this.props.pages instanceof Error) {
      results = this.renderError(`Could not load pages: ${this.props.pages.message}`);
    }
    else if (this.props.pages.length === 0) {
      results = this.renderError('There were no page results.', 'warning');
    }
    else {
      results = this.renderPages();
    }

    return (
      <div className="container-fluid container-list-view">
        <SearchBar onSearch={this.props.onSearch} />
        {results}
      </div>
    );
  }

  renderPages () {
    return (
      <div className="row">
        <div className="col-md-12">
          <table styleName="page-list" className="table">
            <thead>
              {this.renderHeader()}
            </thead>
            <tbody>
              {this.props.pages.map(page => this.renderRow(page))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  renderHeader () {
    return (
      <tr>
        <th styleName="page-list-th" data-name="capture-date">Capture Date</th>
        <th styleName="page-list-th" data-name="site">Site</th>
        <th styleName="page-list-th" data-name="page-name">Page Name</th>
        <th styleName="page-list-th" data-name="url">URL</th>
      </tr>
    );
  }

  renderRow (record) {
    const onClick = this.didClickRow.bind(this, record);

    return (
      <tr styleName="page-list-tbody-tr" key={record.uuid} onClick={onClick}>
        <td styleName="page-list-td">{record.latest ? dateFormatter.format(record.latest.capture_time) : 'No saved versions'}</td>
        <td styleName="page-list-td">{formatSites(record.tags)}</td>
        <td styleName="page-list-td">{record.title}</td>
        <td styleName="page-list-td"><a href={record.url} target="_blank" rel="noopener">{record.url}</a></td>
      </tr>
    );
  }

  // TODO: we use similar markup elsewhere, consider making this a component
  renderError (message, type = 'danger') {
    return (
      <div className="container-fluid container-list-view">
        <p className={`alert alert-${type}`} role="alert">
          {message}
        </p>
      </div>
    );
  }

  didClickRow (page, event) {
    if (isInAnchor(event.target)) {
      return;
    }

    this.props.history.push(`/page/${page.uuid}`);
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
