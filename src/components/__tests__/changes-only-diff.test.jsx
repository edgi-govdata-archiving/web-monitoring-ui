/* eslint-env jest */

import React from 'react';
import {shallow} from 'enzyme';
import ChangesOnlyDiff from '../changes-only-diff';

describe('changes-only-diff', () => {
  it('outputs message if there are no changes', () => {
    const diffData = {change_count: 0};
    const diff = shallow(<ChangesOnlyDiff diffData={diffData}/>);
    expect(diff.text()).toBe('There were no changes for this diff type.');
  });
});
