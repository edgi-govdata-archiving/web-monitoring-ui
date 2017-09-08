import React from 'react';
import DiffItem from './diff-item';
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

    const changesOnly = this.props.diff.content.diff.filter(currentValue => {
      return currentValue[0] !== 0;
    });

    return (
      <List
        data={changesOnly}
        component={DiffItem}
        className={this.props.className}
      />
    );
  }
}


/** TODO: Putting contextual diffs off until after v0
   * Truncating function to process changes-only diffs.
   * If `currentValue` is an insertion or deletion we return it as is.
   * If it's not, we truncate it depending on if changes occured in entries before or after it.
   * @param {array|Object} currentValue
   * @param {number} index
   * @param {diff[]} diffs
   * @returns {[number, string]}
   */
// function getContextualDiff (currentValue, index, diffs) {
//   let [itemType, itemText] = currentValue;
//   if (itemType !== 0) return currentValue;

//   // Naive approach, needs massive improvement
//   const contextLength = 50;
//   let strContext = '';

//   if (diffs[index - 1] && diffs[index - 1][0] !== 0) {
//     strContext += `${itemText.substring(0, contextLength)}\n`;
//   }
//   if (diffs[index + 1] && diffs[index + 1][0] !== 0) {
//     strContext += `\n${itemText.substring(itemText.length - contextLength)}`;
//   }
//   return [itemType, strContext];
// }
