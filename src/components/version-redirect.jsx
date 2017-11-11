import React from 'react';
import {Redirect} from 'react-router-dom';
import Loading from './loading';

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
    this.props.api.getVersionById(versionId)
      .then(data => this.setState({pageId: data.page_uuid}))
      .catch(error => this.setState({error: error}));
  }

  render () {
    if (this.state.error) {
      return (
        <p className="alert alert-danger" role="alert">
          Error: We couldn't find the version you're looking for.
          Please check you provided the correct versionID or alert the dev team.
        </p>
      );
    }

    if (!this.state.pageId) {
      return <Loading />;
    }
    return <Redirect to={`/page/${this.state.pageId}/..${this.props.match.params.versionId}`} />;
  }
}
