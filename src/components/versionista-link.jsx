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
 * @typedef VersionistaLinkProps
 * @property {Version[]} versions
 * @property {Version} from
 * @property {Version} to
 */

/**
 * A link that points to Versionista diffs
 *
 * @class VersionistaLink
 * @extends {React.Component}
 * @param {VersionistaLinkProps} props
 */
export default class VersionistaLink extends React.Component {
  constructor (props) {
    super (props);
    this.renderDiffError = this.renderDiffError.bind(this);
    this.renderLink = this.renderLink.bind(this);
  }

  render () {
    const message = this.renderDiffError();

    return (
      <div className='versionista-link'>
        {(message) ? message : this.renderLink()}
        <Tooltip id="versionista-tooltip" />
      </div>
    )
  }

  /**
   * In practice, that's not always the case:
   * https://monitoring-staging.envirodatagov.org/page/de2762b0-b88b-4645-ae3d-480f612bda86/6767cfa5-b643-4d90-88e4-8190ca427b53..0d1f4170-2144-4e51-8660-991cd295c21c
   *
   * https://versionista.com/74273/6210778/
   * Our versions don't always align perfectly with Versionista and it's probably
   * beyond the scope of the UI to scrape Versionista and make sure they do.
   */
  renderDiffError () {
    const versions = this.props.versions;
    const fromIndex = versions.findIndex(this.compareWith(this.props.from.source_metadata.version_id));
    const toIndex = versions.findIndex(this.compareWith(this.props.to.source_metadata.version_id));

    /**
     * Versionista stores only 50 versions: The latest 49 and the first captured version.
     * 'lastViableIndex' represents the theoretical last index in 'versions' that *should* have a diff.
     */
    const lastViableIndex = 48;
    const indexOfFirstVersion = versions.length - 1;
    let datesWithoutDiff = [];

    if (fromIndex > lastViableIndex && fromIndex !== indexOfFirstVersion) {
      datesWithoutDiff.push(dateFormatter.format(this.props.from.capture_time));
    }
    if (toIndex > lastViableIndex && fromIndex !== indexOfFirstVersion) {
      datesWithoutDiff.push(dateFormatter.format(this.props.to.capture_time));
    }
    if (datesWithoutDiff.length > 0) {
      return datesWithoutDiff.map(value => {
        return(
          <span>Version from <strong>{value}</strong> is no longer in Versionista. </span>
        )
      });
    } else {
      return null;
    }
  }

  renderLink () {
    const account = this.props.from.source_metadata.account;
    const siteId = this.props.from.source_metadata.site_id;
    const pageId = this.props.from.source_metadata.page_id;

    let fromVersionId = +this.props.from.source_metadata.version_id;
    let toVersionId   = +this.props.to.source_metadata.version_id;

    // Switch 'from' and 'to' if necessary because versionista expects the latest version to always be 'to'.
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
          data-for="versionista-tooltip"
          data-tip="This is temporary"
        >
          {account}
        </a>
      </span>
    )
  }

  compareWith (index) {
    return element => element.source_metadata.version_id === index;
  }
}
