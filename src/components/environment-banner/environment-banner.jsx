import { Component } from 'react';
import styles from './environment-banner.css';

/**
 * @typedef EnvironmentBannerProps
 * @property {string} apiUrl
 */

/**
 * A banner to conditionally display warnings to users about the environment.
 *
 * @class EnvironmentBanner
 * @extends {Component}
 * @param {EnvironmentBannerProps} props
 */
export default class EnvironmentBanner extends Component {
  constructor (props) {
    super(props);
    this.state = {
      apiEnvironment: 'production',
      dismissed: false,
    };
  }

  componentDidMount () {
    // This is not a good method, but a proof of concept.
    // TODO: see about querying the data via this.context.api
    const urlMatch = this.props.apiUrl.match(/(?:api|monitoring)-([^.]+)/i);
    const environment = urlMatch ? urlMatch[1] : 'production';
    if (environment) {
      this.setState({ apiEnvironment: environment });
    }
  }

  dismiss () {
    this.setState({ dismissed: true });
  }

  render () {
    const showBanner =
      !(this.state.apiEnvironment === 'production')
      && !this.state.dismissed;

    return showBanner ? (
      <section className={styles.section}>
        <p className={styles.title}>Environment: {this.state.apiEnvironment}</p>
      </section>
    ) : null;
  }
}
