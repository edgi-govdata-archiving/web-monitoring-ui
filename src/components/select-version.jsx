import { PureComponent } from 'react';
import { dateFormatter } from '../scripts/formatters';

/**
 * A select dropdown listing page versions
 *
 * @class SelectVersion
 * @extends {PureComponent}
 * @param {Object} props
 * @param {Version} [props.value] The currently selected version
 * @param {Version[]} props.versions The list of versions to display
 * @param {Version} props.onChange Callback for new selection. `Version => void`
 */
export default class SelectVersion extends PureComponent {
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
          {redirectLabel(version)}
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
    case 'versionista':         return ' (Versionista)';
    case 'internet_archive':    return ' (Wayback)';
    case 'edgi_statuscheck_v0': return ' (EDGI)';
    case 'edgi_crawl_v0':       return ' (EDGI)';
    default:                    return '';
  }
}

function statusLabel (version) {
  const status = version.status || 200;
  if (version.network_error) {
    return '✗ (Error) ';
  }
  else if (status >= 400) {
    return `✗ (${version.status} Error) `;
  }
  else if (version.content_length === 0) {
    return '✗ (No Content) ';
  }
  else {
    return '';
  }
}

function redirectLabel (version) {
  const meta = version.source_metadata;
  if (meta && (meta.redirects || meta.redirected_url)) {
    return '⇢ ';
  }
  return '';
}
