import '../css/styles.css';
import '../css/diff.css';
import React from 'react';
import ReactDOM from 'react-dom';
import WebMonitoringUi from '../components/web-monitoring-ui';

ReactDOM.render(
  <WebMonitoringUi />,
  document.getElementById('web-monitoring-ui-root')
);
