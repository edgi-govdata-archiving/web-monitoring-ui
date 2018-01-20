/* eslint-env jest */

import React from 'react';
import {shallow} from 'enzyme';
import SideBySideRenderedDiff from '../side-by-side-rendered-diff';

describe('side-by-side-rendered-diff', () => {
  it('outputs message if there are no changes', () => {
    const diffData = {change_count: 0};
    const diff = shallow(<SideBySideRenderedDiff diffData={diffData}/>);
    expect(diff.text()).toBe('There were no changes for this diff type.');
  });
});
