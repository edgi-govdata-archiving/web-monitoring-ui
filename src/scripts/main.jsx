import 'normalize.css';
import '../css/styles.css';
import '../css/global.css';
import { createRoot } from 'react-dom/client';
import WebMonitoringUi from '../components/web-monitoring-ui';

const root = createRoot(document.getElementById('web-monitoring-ui-root'));
root.render(<WebMonitoringUi />);
