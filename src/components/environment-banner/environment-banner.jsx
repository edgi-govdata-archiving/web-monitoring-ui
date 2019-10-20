import React from 'react';
import './environment-banner.css';

/**
 * @typedef EnvironmentBannerProps
 * @property {string} apiUrl
 */

/**
 * A banner to conditionally display warnings to users about the environment.
 *
 * @class EnvironmentBanner
 * @extends {React.Component}
 * @param {EnvironmentBannerProps} props
 */
export default class EnvironmentBanner extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      apiEnvironment: 'production',
      dismissed: false,
    };
  }

  componentDidMount() {
    // This is not a good method, but a proof of concept.
    // TODO: see about querying the data via this.context.api
    const environment = (this.props.apiUrl.match(/api-([^.]+)/i) || [])[1];
    if (environment) {
      this.setState({apiEnvironment: environment});
    }
  }

  dismiss() {
    this.setState({dismissed: true});
  }

  render() {
    const showBanner =
      !(this.state.apiEnvironment === 'production')
      && !this.state.dismissed;

    return showBanner ? (
      <section styleName='section' className='bg-warning'>
        <div className='container-fluid'>
          <p styleName='title'>Environment: {this.state.apiEnvironment}</p>
        </div>
      </section>
    ) : null;
  }
}
