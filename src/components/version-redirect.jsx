import React from 'react';
import {Redirect} from 'react-router-dom';

export default class VersionRedirect extends React.Component {
  constructor (props) {
    super (props);
    this.state = {
      pageId: null
    };
  }

  componentDidMount () {
    const versionId = this.props.match.params.versionId;
    this.props.api.getVersionById(versionId).then(data => {
      this.setState({pageId: data.page_uuid});
    });
  }

  render () {
    if (!this.state.pageId) {
      return null;
    }
    return <Redirect to={`/page/${this.state.pageId}/..${this.props.match.params.versionId}`} />;
  }
}
