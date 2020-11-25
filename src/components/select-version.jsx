import React from 'react';
import { dateFormatter } from '../scripts/formatters';

/**
 * A select dropdown listing page versions
 *
 * @class SelectVersion
 * @extends {React.PureComponent}
 * @param {Object} props
 * @param {Version} [props.value] The currently selected version
 * @param {Version[]} props.versions The list of versions to display
 * @param {Version} props.onChange Callback for new selection. `Version => void`
 */
export default class SelectVersion extends React.PureComponent {
  render () {
    const value = this.props.value ? this.props.value.uuid : '';
    const versions = this.props.versions;
    const handleChange = event => {
      const newValue = event.target.value;
      this.props.onChange(versions.find(v => v.uuid === newValue));
    };

    const options = versions.map(version => {
      return (
        <option key={version.uuid} value={version.uuid}>
          {statusLabel(version)}
          {dateFormatter.format(version.capture_time)}
          {sourceLabel(version)}
        </option>
      );
    });

    return (
      <select onChange={handleChange} value={value}>
        <option value="">none</option>
        {options}
      </select>
    );
  }
}

function sourceLabel (version) {
  switch (version.source_type) {
    case 'versionista':      return ' (Versionista)';
    case 'internet_archive': return ' (Wayback)';
    default:                 return '';
  }
}

function statusLabel (version) {
  const status = version.status || 200;
  if (status >= 400) {
    return `✗ (${version.status} Error) `;
  }
  else if (version.content_length === 0) {
    return '✗ (No Content) ';
  }
  else {
    return '';
  }
}
