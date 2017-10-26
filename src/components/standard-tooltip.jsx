import React from 'react';
import Tooltip from 'react-tooltip';

export default function StandardTooltip (props) {
  return <Tooltip place="top" effect="solid" {...props} />;
}
