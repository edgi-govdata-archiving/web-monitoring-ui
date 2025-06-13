import { createContext } from 'react';
import WebMonitoringApi from '../services/web-monitoring-api';
import WebMonitoringDb from '../services/web-monitoring-db';

export const ApiContext = createContext({
  /** @type {WebMonitoringDb | null} */
  api: null,
  /** @type {WebMonitoringApi | null} */
  localApi: null
});

export { WebMonitoringApi, WebMonitoringDb };
