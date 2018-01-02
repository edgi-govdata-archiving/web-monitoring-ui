import {dateFormatter} from '../scripts/formatters';
import React from 'react';
import Loading from './loading';

/**
 * These props also inherit from React Router's RouteComponent props
 * @typedef {Object} PageListProps
 * @property {Page[]} pages
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

    return (
      <div className="container-fluid container-list-view">
        <div className="row">
          <div className="col-md-12">
            <table className="container-list-view__list table">
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
        <th className="list__header--capture-date">Capture Date</th>
        <th className="list__header--site">Site</th>
        <th className="list__header--page-name">Page Name</th>
        <th className="list__header--url">URL</th>
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
