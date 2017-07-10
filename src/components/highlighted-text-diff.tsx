import * as React from 'react';
import List from './list';
import DiffItem from './diff-item';


export default class HighlightedTextDiff extends React.Component<any,any> {
  render() {
    if (!this.props) {
      return null;
    }
    return (
      <div>
        <List data={this.props.diff.content.diff} component={DiffItem} />
      </div>
    );
  }
}
