/* eslint-env jest */

import React from 'react';
import {shallow} from 'enzyme';
import InlineRenderedDiff from '../inline-rendered-diff';

describe('inline-rendered-diff', () => {
  it('outputs message if there are no changes', () => {
    const diffData = {change_count: 0};
    const diff = shallow(<InlineRenderedDiff diffData={diffData}/>);
    expect(diff.text()).toBe('There were no changes for this diff type.');
  });
});
