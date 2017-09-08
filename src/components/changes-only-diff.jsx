import React from 'react';
import DiffItem from './diff-item';
import List from './list';

// The context for a change should be constrained to this many lines
const maxContextLines = 3;
// If the context is only a single line, it should be constrained to this length
const maxContextLineLength = 300;

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

    const changesOnly = this.props.diff.content.diff.map(getContextualDiff);

    return (
      <List
        data={changesOnly}
        component={DiffItem}
        className={this.props.className}
      />
    );
  }
}


/**
 * Trim parts of diff entries where there are no changes to show only a few
 * lines or characters on the ends adjacent to actual changes.
 * If `currentValue` is an insertion or deletion we return it as is.
 * If it's not, we truncate it depending on if changes occured in entries before or after it.
 * @param {[number, string]} currentValue
 * @param {number} index
 * @param {Array.<[number, string]>} diffs
 * @returns {[number, string]}
 */
function getContextualDiff (currentValue, index, diffs) {
  let [itemType, itemText] = currentValue;
  if (itemType !== 0) return currentValue;

  // Determine whether there is content that actually needs trimming
  let lines = itemText.split('\n');
  const singleLine = lines.length === 1;
  if (!singleLine && lines.length <= maxContextLines) return currentValue;

  const hasPreviousChange = diffs[index - 1] && diffs[index - 1][0] !== 0;
  const hasNextChange = diffs[index + 1] && diffs[index + 1][0] !== 0;

  let contextLength = singleLine ? maxContextLineLength : maxContextLines;
  if (hasPreviousChange && hasNextChange) {
    contextLength *= 2;
  }
  if ((singleLine ? lines[0] : lines).length <= contextLength) {
    return currentValue;
  }

  // ...and actually do the trimming
  let newText = [];
  if (hasPreviousChange) {
    if (singleLine) {
      newText.push(lines[0].slice(0, maxContextLineLength));
    }
    else {
      newText.push(lines.slice(0, maxContextLines).join('\n') + '\n');
    }
  }

  // Just divide with an ellipsis for now, could be fancier in the future
  newText.push('…');

  if (hasNextChange) {
    if (singleLine) {
      newText.push(lines[0].slice(-maxContextLineLength));
    }
    else {
      newText.push('\n' + lines.slice(-maxContextLines).join('\n'));
    }
  }

  return [itemType, newText.join('')];
}
