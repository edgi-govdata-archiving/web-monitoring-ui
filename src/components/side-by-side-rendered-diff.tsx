import * as React from 'react';


export default class SideBySideRenderedDiff extends React.Component<any,any> {
  render() {
    if (!this.props) {
      return null;
    }
    return (
      <div>
        <iframe src={this.props.a.uri} />
        <hr />
        <iframe src={this.props.b.uri} />
      </div>
    );
  }
}
