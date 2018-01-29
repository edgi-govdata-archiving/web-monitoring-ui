/**
 *  A banner to conditionally display warnings to users about the environment.
 */

import React from 'react';
import WebMonitoringApi from '../services/web-monitoring-api';
import WebMonitoringDb from '../services/web-monitoring-db';

export default class EnvironmentBanner extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      apiEnv: 'production',
      dismissed: false,
    };
    
    // Would be preferable to use WebMonitoringDb rather than parse environment
    // info from the API URL.

    // webMonitoringConfig is a global, unimported external dependency
    // We expect it to be in the 'window' namepace.
    // this.dbapi  = new WebMonitoringDb({
    //   url: webMonitoringConfig.WEB_MONITORING_DB_URL
    // });
  }

  componentDidMount() {
    // This is not a good method, but a proof of concept.
    // A better method would result from querying the data via this.dbapi
    const environment = (this.props.apiUrl.match(/api-([^.]+)/i) || [])[1];
    if (environment) {
      this.setState({apiEnv: environment});
    }
  }

  dismiss() {
    this.setState({dismissed: true});
  }

  render() {
    const showBanner = !(this.state.apiEnv === 'production') && !this.state.dismissed;

    return showBanner ? (
      <section className='environment-banner bg-warning'>
        <div className='container-fluid'>
          <p>Environment: {this.state.apiEnv}</p>
          {/* Uncomment to make dismissible
           <div className='close-x' onClick={this.dismiss.bind(this)}>✕</div>
           */}
        </div>
      </section>
    ) : null
  }
}


