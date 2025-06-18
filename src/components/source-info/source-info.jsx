import { Component } from 'react';
import styles from './source-info.css';

/**
 * @typedef SourceInfoProps
 * @property {Version} from
 * @property {Version} to
 * @property {String} pageUrl
 */

/**
 * Renders link to see Wayback Machine calendar view of the page
 * If one or both of the versions were sourced from Wayback, this component renders links to the Wayback Machine source url(s)
 *
 * @class SourceInfo
 * @extends {Component}
 * @param {SourceInfoProps} props
 */

const sourceTypeName = {
  internet_archive: 'Wayback Machine'
};

export default class SourceInfo extends Component {
  render () {
    const waybackCalendarUrl = `https://web.archive.org/web/*/${this.props.pageUrl}`;
    const waybackCalendarLink = (
      <li className={styles.sourceInfoListItem} key={waybackCalendarUrl}>
        <a
          className={styles.sourceInfoLink}
          href={waybackCalendarUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <i className="fa fa-calendar fa-no-hover" aria-hidden="true" />
          Wayback Machine calendar view
        </a>
      </li>
    );
    const links = [waybackCalendarLink];

    if (this.props.from.source_metadata.view_url) {
      const fromLink = (
        <li className={styles.sourceInfoListItem} key={this.props.from.source_metadata.view_url}>
          <span aria-hidden="true"> | </span>
          <a
            className={styles.sourceInfoLink}
            href={this.props.from.source_metadata.view_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fa fa-arrow-left fa-no-hover" aria-hidden="true" />
            {sourceTypeName[this.props.from.source_type]} previous page version
          </a>
        </li>
      );

      links.push(fromLink);
    }

    if (this.props.to.source_metadata.view_url) {
      const toLink = (
        <li className={styles.sourceInfoListItem} key={this.props.to.source_metadata.view_url}>
          <span aria-hidden="true"> | </span>
          <a
            className={styles.sourceInfoLink}
            href={this.props.to.source_metadata.view_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {sourceTypeName[this.props.to.source_type]} next page version
            <i className="fa fa-arrow-right fa-right-icon fa-no-hover" aria-hidden="true" />
          </a>
        </li>
      );

      links.push(toLink);
    }

    return (
      <aside>
        <ol className={styles.sourceInfoList}>
          {links}
        </ol>
      </aside>
    );
  }
}
