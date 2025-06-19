import 'normalize.css';
import '../css/styles.css';
import '../css/global.css';
import ReactDOM from 'react-dom';
import WebMonitoringUi from '../components/web-monitoring-ui';

ReactDOM.render(
  <WebMonitoringUi />,
  document.getElementById('web-monitoring-ui-root')
);
