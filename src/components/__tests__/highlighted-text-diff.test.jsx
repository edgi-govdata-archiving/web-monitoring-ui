/* eslint-env jest */

import React from 'react';
import {shallow} from 'enzyme';
import HighlightedTextDiff from '../highlighted-text-diff';

describe('highlighted-text-diff', () => {
  it('outputs message if there are no changes', () => {
    const diffData = {change_count: 0};
    const diff = shallow(<HighlightedTextDiff diffData={diffData}/>);
    expect(diff.text()).toBe('There were no changes for this diff type.');
  });
});
