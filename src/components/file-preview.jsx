import React from 'react';
import PropTypes from 'prop-types';

export const FilePreview = ({ version }) => {
  if (!version || !version.content) {
    return <div className="file-preview">No file data available</div>;
  }

  const fileInfo = {
    type: version.content_type || 'Unknown type',
    size: formatFileSize(version.content.length),
    // Note: You might want to add hash if available in your data
  };

  return (
    <div className="file-preview">
      <h3>File Information</h3>
      <dl>
        <dt>Type:</dt>
        <dd>{fileInfo.type}</dd>
        <dt>Size:</dt>
        <dd>{fileInfo.size}</dd>
      </dl>
      <a 
        href={`/api/versions/${version.uuid}/raw`} 
        className="button"
        download
      >
        Download Raw File
      </a>
    </div>
  );
};

FilePreview.propTypes = {
  version: PropTypes.shape({
    content: PropTypes.string,
    content_type: PropTypes.string,
    uuid: PropTypes.string
  })
};

function formatFileSize(bytes) {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
} 