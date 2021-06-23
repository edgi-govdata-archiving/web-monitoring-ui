/* eslint-env jest */

import PageList from '../page-list/page-list';
import React from 'react';
import SearchBar from '../search-bar/search-bar';
import Loading from '../loading';
import { shallow } from 'enzyme';
import simplePages from '../../__mocks__/simple-pages.json';

describe('page-list', () => {
  let globalOpen;

  /* eslint-disable no-undef */
  beforeEach(() => {
    globalOpen = global.open;
  });

  afterEach(() => {
    global.open = globalOpen;
  });

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

  it('shows domain without www prefix', () => {
    const pageList = shallow(
      <PageList pages={simplePages} />
    );
    expect(pageList.find('tbody tr').first().childAt(0).text())
      .toBe('ncei.noaa.gov');
  });

  it('shows non-URL related tags', () => {
    const pageList = shallow(<PageList pages={simplePages} />);
    const tagsCell = pageList.find('tbody tr').first().childAt(3);

    expect(tagsCell.children().every('PageTag')).toBe(true);
    expect(tagsCell.children().length).toBe(1);
    expect(tagsCell.children().first().props())
      .toHaveProperty('tag.name', 'Human');
  });

  it('displays SearchBar component', () => {
    const pageList = shallow(
      <PageList />
    );
    expect(pageList.find(SearchBar).length).toBe(1);
  });

  it('displays Loading component when there are no pages', () => {
    const pageList = shallow(
      <PageList />
    );
    expect(pageList.find(Loading).length).toBe(1);
  });

  it('does not display Loading component when there are pages', () => {
    const pageList = shallow(
      <PageList pages={simplePages} />
    );
    expect(pageList.find(Loading).length).toBe(0);
  });

  it('opens a new window when a user control clicks on a page row', () => {
    global.open = jest.fn();
    const pageList = shallow(
      <PageList pages={simplePages} />
    );

    pageList.find('tr[data-name="info-row"]').first().simulate('click', { ctrlKey : true });

    expect(global.open.mock.calls[0][0]).toBe('/page/9420d91c-2fd8-411a-a756-5bf976574d10');
    expect(global.open.mock.calls[0][1]).toBe('_blank');
  });

  it('opens a new window when a user command clicks on a page row', () => {
    global.open = jest.fn();
    const pageList = shallow(
      <PageList pages={simplePages} />
    );

    pageList.find('tr[data-name="info-row"]').first().simulate('click', { metaKey : true });

    expect(global.open.mock.calls.length).toBe(1);
  });
  /* eslint-enable no-undef */
});
