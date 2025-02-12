/* eslint-env jest */
import timers from 'node:timers/promises';
import PageDetails from '../page-details/page-details';
import { shallow } from 'enzyme';
import simplePage from '../../__mocks__/simple-page.json';
import WebMonitoringDb from '../../services/web-monitoring-db';

describe('page-details', () => {
  // Change string values to date objects so they're parsed correctly
  simplePage.versions.forEach(version => {
    version.capture_time = new Date(version.capture_time);
  });
  const match = { params: { pageId: simplePage.uuid } };
  const createMockApi = () => {
    let samples = simplePage.versions.reduce((samples, version) => {
      const key = version.capture_time.toISOString().slice(0, 10);
      if (key in samples) {
        samples[key].version_count += 1;
      }
      else {
        samples[key] = {
          time: key,
          version_count: 1,
          version
        };
      }
      return samples;
    }, {});
    samples = Object.values(samples).sort((a, b) => a.time < b.time ? 1 : -1);

    return Object.assign(Object.create(WebMonitoringDb.prototype), {
      getPage: jest.fn().mockResolvedValue({ ...simplePage }),
      getVersion: jest.fn(id => Promise.resolve(
        simplePage.versions.find(v => v.uuid === id)
      )),
      getVersions: jest.fn().mockResolvedValue(simplePage.versions),
      sampleVersions: jest.fn().mockResolvedValue(samples)
    });
  };

  it('can render', () => {
    const mockApi = createMockApi();
    const pageDetails = shallow(
      <PageDetails
        match={match}
      />,
      { context: { api: mockApi } }
    );

    expect(pageDetails.exists()).toEqual(true);
    // It should always have rendered *something.*
    expect(pageDetails.get(0)).toBeTruthy();
  });

  it('shows correct title', async () => {
    const mockApi = createMockApi();
    const pageDetails = shallow(
      <PageDetails
        match={match}
      />,
      { context: { api: mockApi } }
    );

    await timers.setTimeout(10);
    expect(mockApi.getPage).toHaveBeenCalled();
    expect(mockApi.sampleVersions).toHaveBeenCalled();

    expect(document.title).toBe('Scanner | http://www.ncei.noaa.gov/news/earth-science-conference-convenes');

    pageDetails.unmount();
    expect(document.title).toBe('Scanner');
  });

  it('gets versions missing from the sample', async () => {
    const allVersions = simplePage.versions;
    const mockApi = createMockApi();
    const pageDetails = shallow(
      <PageDetails
        match={{
          ...match,
          params: {
            ...match.params,
            change: `${allVersions.at(-1).uuid}..${allVersions[0].uuid}`
          }
        }}
      />,
      { context: { api: mockApi } }
    );

    await timers.setTimeout(10);
    expect(mockApi.getPage).toHaveBeenCalled();
    expect(mockApi.sampleVersions).toHaveBeenCalled();
    expect(mockApi.getVersion).toHaveBeenCalled();

    // expect(document.title).toBe('Scanner | http://www.ncei.noaa.gov/news/earth-science-conference-convenes');
    expect(pageDetails.exists()).toEqual(true);
    // It should always have rendered *something.*
    expect(pageDetails.get(0)).toBeTruthy();
  });
});
