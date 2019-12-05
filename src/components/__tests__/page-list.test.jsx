/* eslint-env jest */

import PageList from '../page-list/page-list';
import React from 'react';
import SearchBar from '../search-bar/search-bar';
import Loading from '../loading';
import {shallow} from 'enzyme';
import simplePages from '../../__mocks__/simple-pages.json';

describe('page-list', () => {
  // Change string values to date objects so they're parsed correctly
  simplePages.forEach(record => {
    record.latest.capture_time = new Date(record.latest.capture_time);
  });

  it('can render', () => {
    const pageList = shallow(
      <PageList />
    );

    expect(pageList.exists()).toEqual(true);
    // It should always have rendered *something.*
    expect(pageList.get(0)).toBeTruthy();
  });

  it('shows only sites from tags', () => {
    const pageList = shallow(
      <PageList
        pages={simplePages}
      />
    );
    expect(pageList.find('tbody tr').first().childAt(1).text())
      .toBe('NOAA - ncei.noaa.gov, EPA - www3.epa.gov');
  });

  it('displays SearchBar component when searching', () => {
    const pageList = shallow(
      <PageList 
        pages={null} 
      />
    );
    expect(pageList.find(SearchBar).length).toBe(1);
  });

  it('displays Loading component when searching', () => {
    const pageList = shallow(
      <PageList 
        pages={null} 
      />
    );
    expect(pageList.find(Loading).length).toBe(1);
  });
});
