import React from 'react';
import PropTypes from 'prop-types';
import { FilePreview } from './file-preview';

export const SideBySideFilePreview = ({ from, to }) => {
  return (
    <div className="side-by-side-file-preview">
      <div className="version-a">
        <h4>Previous Version</h4>
        <FilePreview version={from} />
      </div>
      <div className="version-b">
        <h4>Current Version</h4>
        <FilePreview version={to} />
      </div>
    </div>
  );
};

SideBySideFilePreview.propTypes = {
  from: PropTypes.object,
  to: PropTypes.object
}; 