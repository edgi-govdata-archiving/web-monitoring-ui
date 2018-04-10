import {dateFormatter} from '../scripts/formatters';
import React from 'react';

// sizes are in ems
const minSize = 1.2;
const maxSize = 3.5;

/**
 * @typedef {Object} VersionTimelineSelectorProps
 * @property {Version[]} versions
 * @property {Version[]} selectedFromVersion
 * @property {Version[]} selectedToVersion
 * @property {Version[]} onSelect Callback when a new range is selected.
 *   Signature: `(Versions[]) => void`
 */

/**
 * Display a timeline of versions, where the user can select a version range.
 * @class VersionTimelineSelector
 * @extends {React.PureComponent}
 */
export default class VersionTimelineSelector extends React.PureComponent {
  constructor(props) {
    super(props);
    this._selectVersion = this._selectVersion.bind(this);
    this._renderVersion = this._renderVersion.bind(this);

    this.state = {
      selecting: false,
      selectionBuffer: null
    };
  }

  render() {
    return (
      <div className="version-timeline-selector">
        <ol className="version-timeline-selector__list">
          {this.props.versions.map(this._renderVersion)}
        </ol>
      </div>
    );
  }

  /**
   * Render a single version on the timeline
   * @param {Version} version
   * @returns {HTMLElement}
   */
  _renderVersion(version) {
    let size = (maxSize + minSize) / 2;
    if (version.source_type === 'versionista') {
      const sizeFactor = version.source_metadata.diff_length / 30000;
      const sizeRange = maxSize - minSize;
      size = Math.min(maxSize, minSize + sizeRange * sizeFactor);
    }

    const style = { width: `${size}em`, height: `${size}em` };
    const classes = [];

    const fullDate = dateFormatter.format(version.capture_time);
    let title = `${fullDate} (${version.source_type})`;
    if (version.source_metadata.errorCode) {
      classes.push('error-version');
      title = `${title}\n${version.source_metadata.errorCode} Error`;
      style.width = style.height = '';
    }

    if (this.state.selecting) {
      if (version === this.state.selectionBuffer) {
        classes.push('provisionally-selected');
      }
    } else {
      if (
        version === this.props.selectedFromVersion ||
        version === this.props.selectedToVersion
      ) {
        classes.push('selected');
      }
    }

    return (
      <li
        style={style}
        title={title}
        className={classes.join(' ')}
        data-version={version.uuid}
        key={version.uuid}
        onClick={this._selectVersion}
        tabIndex={0}
      >
        <span className="version-timeline-selector__label">
          {version.capture_time.getMonth() + 1}/{version.capture_time.getDate()}
        </span>
        {/* TODO: other metadata */}
      </li>
    );
  }

  _selectVersion(event) {
    event.preventDefault();
    const uuid = event.currentTarget.dataset.version;
    const version = this.props.versions.find(v => v.uuid === uuid);

    if (this.state.selecting) {
      const selection = [this.state.selectionBuffer, version].sort(
        (a, b) => a.capture_time - b.capture_time
      );
      this.setState({ selecting: false, selectionBuffer: null });
      if (this.props.onSelect) {
        this.props.onSelect(...selection);
      }
    } else {
      this.setState({ selecting: true, selectionBuffer: version });
    }
  }
}
