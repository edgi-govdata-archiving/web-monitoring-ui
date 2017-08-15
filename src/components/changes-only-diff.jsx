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

    const contextDiff = this.props.diff.content.diff.map(getContextualDiff);

    return (
      <List
        data={contextDiff}
        component={DiffItem}
        className={this.props.className}
      />
    );
  }
}

/**
   * Truncating function to process changes-only diffs.
   * If `currentValue` is an insertion or deletion we return it as is.
   * If it's not, we truncate it depending on if changes occured in entries before or after it.
   * @param {array|Object} currentValue
   * @param {number} index
   * @param {diff[]} diffs
   * @returns {[number, string]}
   */
function getContextualDiff (currentValue, index, diffs) {
  let itemType;
  let itemText;
  // QUESTION: This logic comes from diff-item.jsx.
  // Different services return slightly different json results,
  // with what would be corresponding values switched and in different format???
  // `html_text`: array of array values [number, string]
  // `source`: array of objects {Text<string>, Type<number>}
  // Should this be normalized?
  if (currentValue.constructor === Array) {
    [itemType, itemText] = currentValue;
  }
  else {
    itemType = currentValue.Type;
    itemText = currentValue.Text;
  }

  if (itemType !== 0) return currentValue;

  // Naive approach, needs massive improvement
  const contextLength = 50;
  let strContext = '';

  if (diffs[index - 1] && diffs[index - 1][0] !== 0) {
    strContext += `${itemText.substring(0, contextLength)}\n`;
  }
  if (diffs[index + 1] && diffs[index + 1][0] !== 0) {
    strContext += `\n${itemText.substring(itemText.length - contextLength)}`
  }
  return [itemType, strContext];
}
