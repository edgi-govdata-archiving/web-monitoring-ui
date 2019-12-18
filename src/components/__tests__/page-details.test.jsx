/* eslint-env jest */
import PageDetails from '../page-details';
import React from 'react';
import {shallow} from 'enzyme';
import simplePage from '../../__mocks__/simple-page.json';
import WebMonitoringDb from '../../services/web-monitoring-db';

describe('page-details', () => {
  // Change string values to date objects so they're parsed correctly
  simplePage.versions.forEach(version => {
    version.capture_time = new Date(version.capture_time);
  });
  const match = { params: { pageId: 'samplePageId' }};
  const mockApi = Object.assign(Object.create(WebMonitoringDb.prototype), {
    getDiff () {
      return new Promise(resolve => resolve({
        change_count: 1,
        diff: [[0, 'Hi'], [1, '!']]
      }));
    },
    getPage (a) {
      return new Promise(resolve => resolve(simplePage));
    },
    getVersions (a, b, c) {
      return new Promise(resolve => resolve(simplePage.versions));
    },
    annotateChange (a, b, c, d) {
      return 'something';
    }
  });

  it('can render', () => {
    const pageDetails = shallow(
      <PageDetails
        match={match}
      />,
      {context: {api: mockApi}}
    );

    expect(pageDetails.exists()).toEqual(true);
    // It should always have rendered *something.*
    expect(pageDetails.get(0)).toBeTruthy();
  });

  it('shows correct title', () => {
    const pageDetails = shallow(
      <PageDetails
        match={match}
      />,
      {context: {api: mockApi}}
    );
    const instance = pageDetails.instance();
    instance.state.page = simplePage;
    instance.componentDidUpdate(instance.props);

    expect(document.title).toBe('Scanner | http://www.ncei.noaa.gov/news/earth-science-conference-convenes');

    pageDetails.unmount();

    expect(document.title).toBe('Scanner');
  });
});
