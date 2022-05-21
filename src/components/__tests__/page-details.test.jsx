/* eslint-env jest */
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
    return Object.assign(Object.create(WebMonitoringDb.prototype), {
      getPage: jest.fn().mockResolvedValue(simplePage),
      getVersions: jest.fn().mockResolvedValue(simplePage.versions)
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

    await mockApi.getPage.mock.results[0].value;
    await mockApi.getVersions.mock.results[0].value;

    expect(document.title).toBe('Scanner | http://www.ncei.noaa.gov/news/earth-science-conference-convenes');

    pageDetails.unmount();
    expect(document.title).toBe('Scanner');
  });
});
