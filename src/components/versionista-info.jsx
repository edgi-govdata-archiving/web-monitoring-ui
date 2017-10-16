import React from 'react';
import Tooltip from 'react-tooltip';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  month: 'long',
  second: 'numeric',
  year: 'numeric'
});

/**
 * @typedef VersionistaInfoProps
 * @property {Version[]} versions
 * @property {Version} from
 * @property {Version} to
 */

/**
 * This component either creates a link that points to the corresponding Versionista diff
 * or provides info if a diff is no longer in Versionista.
 *
 * @class VersionistaInfo
 * @extends {React.Component}
 * @param {VersionistaInfoProps} props
 */
export default class VersionistaInfo extends React.Component {
  constructor (props) {
    super (props);
    this.renderDiffMessage = this.renderDiffMessage.bind(this);
    this.renderLink = this.renderLink.bind(this);
    this.notInVersionista = this.notInVersionista.bind(this);
    this.getDatesWithoutDiff = this.getDatesWithoutDiff.bind(this);
  }

  render () {
    let message;
    if (!this.props.from || !this.props.to) {
      message = <span>There is only one version. No diff to display.</span>;
    } else {
      message = this.renderDiffMessage();
    }

    return (
      <div className="versionista-info">
        {(message) ? message : this.renderLink()}
      </div>
    );
  }

  renderDiffMessage () {
    let datesWithoutDiff = this.getDatesWithoutDiff();
    if (datesWithoutDiff.length > 0) {
      return (
        <span>
          {datesWithoutDiff.map((value, index) => {
            return (
              <span key={index}>
                Version from <strong>{value}</strong> is no longer in Versionista.{' '}
              </span>
            );
          })}
          <i
            className="fa fa-info-circle"
            data-for="message-tooltip"
            data-tip="Versionista stores only 50 versions: The latest 49 and the first captured version."
            aria-hidden="true"
          />
          <Tooltip id="message-tooltip" />
        </span>
      );
    } else {
      return null;
    }
  }

  renderLink () {
    const account = this.props.from.source_metadata.account;
    const siteId = this.props.from.source_metadata.site_id;
    const pageId = this.props.from.source_metadata.page_id;

    // convert to numbers
    let fromVersionId = +this.props.from.source_metadata.version_id;
    let toVersionId   = +this.props.to.source_metadata.version_id;

    /**
     * Switch `from` and `to` if necessary because versionista expects `to` be later than `from`.
     * If we don't do this, than we'll get redirected to the `last two` diff with `to` instead,
     * disregarding `from`. This is because the app doesn't constrain the `to` version like Versionista does.
     */
    if (fromVersionId > toVersionId) {
      const temp = fromVersionId;
      fromVersionId = toVersionId;
      toVersionId = temp;
    }

    return (
      <span>
        <strong>Versionista diff view: </strong>
        <a
          target='_blank'
          href={`https://versionista.com/${siteId}/${pageId}/${toVersionId}:${fromVersionId}`}
        >
          {account}
        </a>
        <i
          className="fa fa-info-circle"
          data-for="versionista-tooltip"
          data-tip="This link to Versionista is temporary and for debugging the transition to the app."
          aria-hidden="true"
        />
        <Tooltip id="versionista-tooltip" />
      </span>
    );
  }

  notInVersionista (index) {
    /**
     * Versionista stores only 50 versions: The latest 49 and the first captured version.
     * `lastViableIndex` represents the theoretical last index in `versions` that *should* have a diff.
     * In practice, that's not always the case. Our versions don't always align perfectly with Versionista,
     * but it's probably beyond the scope of the UI to scrape Versionista and make sure they do.
     */
    const lastViableIndex = 48; // 49 (0-based) - 1 (first version) = 48
    const indexOfFirstVersion = this.props.versions.length - 1; // assume last index is first version
    return (index > lastViableIndex && index !== indexOfFirstVersion);
  }

  getDatesWithoutDiff () {
    const versions = this.props.versions;
    const fromIndex = versions.findIndex(compareWith(this.props.from.source_metadata.version_id));
    const toIndex = versions.findIndex(compareWith(this.props.to.source_metadata.version_id));

    let dates = [];
    if (this.notInVersionista(fromIndex)) {
      dates.push(dateFormatter.format(this.props.from.capture_time));
    }
    if (this.notInVersionista(toIndex)) {
      dates.push(dateFormatter.format(this.props.to.capture_time));
    }

    return dates;
  }
}

function compareWith (index) {
  return element => element.source_metadata.version_id === index;
}
