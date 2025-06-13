/* eslint-env jest */
import { render, waitFor } from '@testing-library/react';
import PageDetails from '../page-details/page-details';
import simplePage from '../../__mocks__/simple-page.json';
import { ApiContext } from '../api-context';
import WebMonitoringDb from '../../services/web-monitoring-db';

jest.mock('../change-view/change-view');

describe('page-details', () => {
  // Change string values to date objects so they're parsed correctly
  simplePage.versions.forEach(version => {
    version.capture_time = new Date(version.capture_time);
  });
  const match = {
    params: {
      pageId: simplePage.uuid,
      change: `${simplePage.versions[1].uuid}..${simplePage.versions[0].uuid}`,
    }
  };
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
      sampleVersions: jest.fn().mockResolvedValue(samples),
    });
  };

  it('can render', () => {
    const mockApi = createMockApi();
    const { container } = render(
      <ApiContext.Provider value={{ api: mockApi }}>
        <PageDetails match={match} />
      </ApiContext.Provider>
    );

    expect(container).not.toBeEmptyDOMElement();
  });

  it('shows correct title', async () => {
    const mockApi = createMockApi();
    const { unmount } = render(
      <ApiContext.Provider value={{ api: mockApi }}>
        <PageDetails match={match} />
      </ApiContext.Provider>
    );

    await waitFor(() => expect(mockApi.getPage).toHaveBeenCalled());
    expect(mockApi.sampleVersions).toHaveBeenCalled();
    expect(document.title).toBe('Scanner | http://www.ncei.noaa.gov/news/earth-science-conference-convenes');

    unmount();
    expect(document.title).toBe('Scanner');
  });

  it('gets versions missing from the sample', async () => {
    const allVersions = simplePage.versions;
    const mockApi = createMockApi();
    const { container } = render(
      <ApiContext.Provider value={{ api: mockApi }}>
        <PageDetails
          match={{
            ...match,
            params: {
              ...match.params,
              change: `${allVersions.at(-1).uuid}..${allVersions[0].uuid}`
            }
          }}
        />,
      </ApiContext.Provider>
    );

    await waitFor(() => expect(mockApi.getPage).toHaveBeenCalled());
    expect(mockApi.sampleVersions).toHaveBeenCalled();
    expect(mockApi.getVersion).toHaveBeenCalled();
    expect(container).not.toBeEmptyDOMElement();
  });

  // TODO: We should have some tests that verify redirects when no versions
  // or only a from or to version was specified, or when a page ID was merged
  // into another page. That requires some complex interaction with the router.
});
