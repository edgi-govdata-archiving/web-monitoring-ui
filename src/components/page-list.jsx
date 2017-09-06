import React from 'react';
import Loading from './loading'

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
  constructor (props) {
    super(props);
    this.state = {
      loaded: false
    }
  }

  componentWillMount () {
    console.log(`will mount - ${this.props.pages}`)
  }
  componentDidMount () {
    console.log(`did mount - ${this.props.pages}`)
  }

  componentWillReceiveProps (nextProps) {
    console.log(`getting props - ${nextProps.pages}`);
    if (this.props.mydomains) {
      console.log('mydomains')
    }
  }

  render () {
    if (!this.props.pages) {
      return (<Loading />);
    }

    return (
      <div className="container-fluid container-list-view">
        <div className="row">
          <div className="col-md-12">
            <table className="table">
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
        <th>ID</th>
        <th>Output Date</th>
        <th>Site</th>
        <th>Page Name</th>
        <th>URL</th>
        <th>Page View URL</th>
        <th>Last Two</th>
        <th>Latest to Base</th>
      </tr>
    );
  }

  renderRow (record) {
    const version = record.latest;
    let versionistaData;
    if (version.source_type === 'versionista') {
      versionistaData = version.source_metadata;
    }

    const diffWithPrevious = versionistaData && this.renderDiffLink(versionistaData.diff_with_previous_url);
    const diffWithFirst = versionistaData && this.renderDiffLink(versionistaData.diff_with_first_url);

    const onClick = this.didClickRow.bind(this, record);

    const shortUrl = `${record.url.substr(0, 20)}…`;
    const rawContentPath = versionistaData && versionistaData.url.replace(/^\w+:\/\/[^/]+\//, '');

    // TODO: click handling
    return (
      <tr key={record.uuid} onClick={onClick}>
        <td>{record.uuid}</td>
        <td>{record.latest.capture_time.toISOString()}</td>
        <td>{record.site}</td>
        <td>{record.title}</td>
        <td><a href={record.url} target="_blank" rel="noopener">{shortUrl}</a></td>
        <td><a href={versionistaData && versionistaData.url} target="_blank" rel="noopener">{rawContentPath}</a></td>
        <td>{diffWithPrevious}</td>
        <td>{diffWithFirst}</td>
      </tr>
    );
  }

  renderDiffLink (url) {
    if (url) {
      return <a href={url} target="_blank">{url.substr(-15)}</a>;
    }

    return <em>[Initial Version]</em>;
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
