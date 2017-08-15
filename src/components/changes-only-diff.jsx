import React from 'react';
import DiffItem from './diff-item-changes-only';
import List from './list';

/**
 * Display a plaintext diff with additions and removals inline.
 *
 * @class ChangesOnlyDiff
 * @extends {React.Component}
 * @param {Object} props
 * @param {ChangeDiff} props.diff
 * @param {string} props.className
 */
export default class ChangesOnlyDiff extends React.Component {
  render () {
    if (!this.props) {
      return null;
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
