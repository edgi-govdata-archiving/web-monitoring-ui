import { Component } from 'react';
import DiffItem from './diff-item';
import List from './list';

/**
 * Display a plaintext diff with additions and removals inline.
 *
 * @class HighlightedTextDiff
 * @extends {Component}
 * @param {Object} props
 * @param {DiffData} props.diffData
 * @param {string} props.className
 */
export default class HighlightedTextDiff extends Component {
  render () {
    return (
      <List
        data={this.props.diffData.diff}
        component={DiffItem}
        className={this.props.className}
      />
    );
  }
}
