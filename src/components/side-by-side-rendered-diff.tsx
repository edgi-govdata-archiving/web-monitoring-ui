import * as React from 'react';


export default class SideBySideRenderedDiff extends React.Component<any,any> {
  render() {
    if (!this.props) {
      return null;
    }
    return (
      <div className="side-by-side-render">
        <iframe src={this.props.a.uri} />
        <hr />
        <iframe src={this.props.b.uri} />
      </div>
    );
  }
}
