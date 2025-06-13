import { Component } from 'react';
import PropTypes from 'prop-types';
import WebMonitoringDb from '../services/web-monitoring-db';
import WebMonitoringApi from '../services/web-monitoring-api';

// The app currently uses React's "legacy" context system (the new one did
// not yet exist when it was built). If/when we upgrade, this should all
// be rewritten (the old API was fully removed in v19).
export class TestApiContextProvider extends Component {
  render () {
    return <>{this.props.children}</>;
  }

  getChildContext () {
    return { api: this.props.api, localApi: this.props.localApi };
  }
}

TestApiContextProvider.childContextTypes = {
  api: PropTypes.instanceOf(WebMonitoringDb),
  localApi: PropTypes.instanceOf(WebMonitoringApi)
};
