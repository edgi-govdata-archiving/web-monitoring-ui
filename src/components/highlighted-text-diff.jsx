import React from 'react';
import DiffItem from './diff-item';
import List from './list';

/**
 * Display a plaintext diff with additions and removals inline.
 *
 * @class HighlightedTextDiff
 * @extends {React.Component}
 * @param {Object} props
 * @param {DiffData} props.diffData
 * @param {string} props.className
 */
export default class HighlightedTextDiff extends React.Component {
  render () {
    if (this.props.diffData.change_count === 0) {
      return <div className="diff-text-inline">
        There were no changes for this diff type.</div>;
    }

    return (
      <List
        data={this.props.diffData.diff}
        component={DiffItem}
        className={this.props.className}
      />
    );
  }
}
