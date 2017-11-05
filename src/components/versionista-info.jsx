import React from 'react';
import StandardTooltip from './standard-tooltip';
import {dateFormatter} from '../scripts/formatters';

/**
 * @typedef VersionistaInfoProps
 * @property {Version[]} versions
 * @property {Version} from
 * @property {Version} to
 */

/**
 * Creates a link that points to the corresponding Versionista diff
 * or provides info if a diff is no longer in Versionista.
 *
 * @class VersionistaInfo
 * @extends {React.Component}
 * @param {VersionistaInfoProps} props
 */
export default class VersionistaInfo extends React.Component {
  render () {
    let message;
    if (!this.props.from
     || !this.props.to
     || this.props.from.source_type !== 'versionista'
     || this.props.to.source_type !== 'versionista') {
      return null;
    }
    else if (this.props.from === this.props.to) {
      message = this.renderPageLink();
    }
    else {
      message = this.renderMissingVersionsMessage();
    }

    return (
      <div className="versionista-info">
        {(message) ? message : this.renderDiffLink()}
      </div>
    );
  }

  renderMissingVersionsMessage () {
    let datesWithoutDiff = this.getDatesWithoutDiff();
    if (datesWithoutDiff.length === 0) {
      return null;
    }

    const missingDates = datesWithoutDiff.join(' and ');
    const plural = datesWithoutDiff.length > 1;

    return (
      <span>
        Version{plural ? 's' : ''} from <strong>{missingDates}</strong>
        {plural ? ' are' : ' is'} no longer in Versionista.
        <i
          className="fa fa-info-circle"
          data-for="message-tooltip"
          data-tip="Versionista stores only 50 versions: The latest 49 and the first captured version."
          aria-hidden="true"
        />
        <StandardTooltip id="message-tooltip" />
      </span>
    );
  }

  renderDiffLink () {
    const {
      account,
      site_id,
      page_id
    } = this.props.from.source_metadata;

    // Ensure IDs are in order -- Versionista doesn't handle this like we do.
    let fromVersionId = +this.props.from.source_metadata.version_id;
    let toVersionId   = +this.props.to.source_metadata.version_id;
    if (fromVersionId > toVersionId) {
      [fromVersionId, toVersionId] = [toVersionId, fromVersionId];
    }

    return (
      <span>
        <a
          target="_blank"
          href={`https://versionista.com/${site_id}/${page_id}/${toVersionId}:${fromVersionId}`}
        >
          View this diff in Versionista (account: {account})
        </a>
        <i
          className="fa fa-info-circle"
          data-for="versionista-tooltip"
          data-tip="This link to Versionista is temporary and for debugging the transition to the app."
          aria-hidden="true"
        />
        <StandardTooltip id="versionista-tooltip" />
      </span>
    );
  }

  renderPageLink () {
    const {
      account,
      site_id,
      page_id
    } = this.props.from.source_metadata;
    return (
      <a target="_blank" href={`https://versionista.com/${site_id}/${page_id}`}>
        The selected versions are the same. View the page in Versionista. (account: {account})
      </a>
    );
  }

  /**
   * Determine whether a version is likely to be missing from Versionista,
   * which only stores 50 versions (the latest 49 and the first).
   * @private
   */
  notInVersionista (version) {
    const index = this.props.versions.findIndex(matchesUuid(version.uuid));
    const lastViableIndex = 48; // 49 (0-based) - 1 (first version) = 48
    const indexOfFirstVersion = this.props.versions.length - 1; // assume last index is first version
    return (index > lastViableIndex && index !== indexOfFirstVersion);
  }

  getDatesWithoutDiff () {
    let dates = [];
    if (this.notInVersionista(this.props.from)) {
      dates.push(dateFormatter.format(this.props.from.capture_time));
    }
    if (this.notInVersionista(this.props.to)) {
      dates.push(dateFormatter.format(this.props.to.capture_time));
    }

    return dates;
  }
}

function matchesUuid (uuid) {
  return version => version.uuid === uuid;
}
