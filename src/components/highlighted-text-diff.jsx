import React from 'react';
import DiffItem from './diff-item';
import List from './list';
import hasChanges from '../scripts/hasChanges';

/**
 * Display a plaintext diff with additions and removals inline.
 *
 * @class HighlightedTextDiff
 * @extends {React.Component}
 * @param {Object} props
 * @param {ChangeDiff} props.diff
 * @param {string} props.className
 */
export default class HighlightedTextDiff extends React.Component {
  render () {
    if (!this.props) {
      return null;
    }

    if (!hasChanges(this.props.diff.content.diff)) {
      return <div className={this.props.className}>There were no changes for this diff type.</div>;
    }

    return (
      <List
        data={this.props.diff.content.diff}
        component={DiffItem}
        className={this.props.className}
      />
    );
  }
}
