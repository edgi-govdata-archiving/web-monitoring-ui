/* eslint-env jest */

import { render, screen, waitFor } from '@testing-library/react';
import DiffView from '../diff-view';
import simplePage from '../../__mocks__/simple-page.json';
import { ApiContext } from '../api-context';
import WebMonitoringDb from '../../services/web-monitoring-db.js';

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
});
