import Loading from './loading';
import PropTypes from 'prop-types';
import React from 'react';
import { Redirect } from 'react-router-dom';
import WebMonitoringDb from '../services/web-monitoring-db';

import '../css/base.css';

export default class VersionRedirect extends React.Component {
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
        <p styleName="alert alert-danger" role="alert">
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

VersionRedirect.contextTypes = {
  api: PropTypes.instanceOf(WebMonitoringDb)
};
