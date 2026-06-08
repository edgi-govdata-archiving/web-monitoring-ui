import { render, screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import DiffView from '../diff-view';
import simplePage from '../../__mocks__/simple-page.json';
import { ApiContext } from '../api-context';
import WebMonitoringDb from '../../services/web-monitoring-db';

describe('diff-view', () => {
  let mockApi;

  beforeEach(() => {
    mockApi = Object.assign(Object.create(WebMonitoringDb.prototype), {
      getDiff: jest.fn().mockResolvedValue({
        change_count: 1,
        diff: [[0, 'Hi'], [1, '!']]
      })
    });
  });

  it('can render', async () => {
    const { container } = render(
      <ApiContext value={{ api: mockApi }}>
        <DiffView
          diffType="HIGHLIGHTED_TEXT"
          page={simplePage}
          a={simplePage.versions[1]}
          b={simplePage.versions[0]}
        />
      </ApiContext>
    );

    expect(container).not.toBeEmptyDOMElement();
    await screen.findByText(/loading/i);
    await waitFor(() => expect(screen.queryByText(/loading/i)).toBeNull());
  });

  it('renders an alert if there are no changes in the diff', async () => {
    mockApi.getDiff.mockResolvedValue({ change_count: 0, diff: [] });

    render(
      <ApiContext value={{ api: mockApi }}>
        <DiffView
          diffType="HIGHLIGHTED_TEXT"
          page={simplePage}
          a={simplePage.versions[1]}
          b={simplePage.versions[0]}
        />
      </ApiContext>
    );

    await screen.findByRole('alert');
  });

  it('renders no alert if there are changes in the diff', async () => {
    render(
      <ApiContext value={{ api: mockApi }}>
        <DiffView
          diffType="HIGHLIGHTED_TEXT"
          page={simplePage}
          a={simplePage.versions[1]}
          b={simplePage.versions[0]}
        />
      </ApiContext>
    );

    await waitFor(() => expect(mockApi.getDiff).toHaveBeenCalled());
    await screen.findByText('Hi');
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('loads and renders raw HTML in RAW diffs for text/html versions', async () => {
    let requestedV0 = false;
    let requestedV1 = false;
    nock('http://example.com')
      .get('/version_0_body')
      .reply(200, () => {
        requestedV0 = true;
        return 'Hello version 0!';
      })
      .get('/version_1_body')
      .reply(200, () => {
        requestedV1 = true;
        return '<!doctype html><html><body>Hello version 1!</body></html>';
      });

    const page = {
      ...simplePage,
      versions: [
        {
          ...simplePage.versions[0],
          media_type: 'application/pdf',
          body_url: 'http://example.com/version_0_body',
        },
        {
          ...simplePage.versions[1],
          media_type: 'text/html',
          body_url: 'http://example.com/version_1_body',
        },
        ...simplePage.versions.slice(2),
      ],
    };

    const { container } = render(
      <ApiContext value={{ api: mockApi }}>
        <DiffView
          diffType="RAW_SIDE_BY_SIDE"
          page={page}
          a={page.versions[1]}
          b={page.versions[0]}
        />
      </ApiContext>
    );

    await waitFor(() => expect(container.querySelector(`iframe[src="${page.versions[0].body_url}"]`)).toBeTruthy());
    await waitFor(() => expect(container.querySelector('iframe[srcdoc]')).toBeTruthy());
    expect(requestedV0).toBe(false);
    expect(requestedV1).toBe(true);
  });
});
