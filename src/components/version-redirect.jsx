import Loading from './loading';
import { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { ApiContext } from './api-context';

import styles from '../css/base.css';

export default class VersionRedirect extends Component {
  static contextType = ApiContext;

  constructor (props) {
    super (props);
    this.state = {
      pageId: null,
      error: null
    };
  }

  componentDidMount () {
    const versionId = this.props.match.params.versionId;
    this.context.api.getVersion(versionId)
      .then(data => {
        if (this.props.match.params.versionId === versionId) {
          this.setState({ pageId: data.page_uuid });
        }
      })
      .catch(error => this.setState({ error: error }));
  }

  render () {
    if (this.state.error) {
      return (
        <p className={[styles.alert, styles.alertDanger].join(' ')} role="alert">
          Error: We couldn't find the version you're looking for.
          Please check you provided the correct versionID.
        </p>
      );
    }

    if (!this.state.pageId) {
      return <Loading />;
    }

    return <Redirect to={`/page/${this.state.pageId}/..${this.props.match.params.versionId}`} />;
  }
}
