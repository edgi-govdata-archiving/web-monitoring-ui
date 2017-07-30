import * as React from 'react';
import * as ReactDOM from 'react-dom';

import WebMonitoringUi from '../components/web-monitoring-ui.jsx';

ReactDOM.render(
    <WebMonitoringUi />,
    document.getElementById('web-monitoring-ui-root') as HTMLElement
);
