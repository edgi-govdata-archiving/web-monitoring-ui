/* eslint-env jest */

import { render, screen, waitFor } from '@testing-library/react';
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
      <ApiContext.Provider value={{ api: mockApi }}>
        <DiffView
          diffType="HIGHLIGHTED_TEXT"
          page={simplePage}
          a={simplePage.versions[1]}
          b={simplePage.versions[0]}
        />
      </ApiContext.Provider>
    );

    expect(container).not.toBeEmptyDOMElement();
  });

  it('renders an alert if there are no changes in the diff', async () => {
    mockApi.getDiff.mockResolvedValue({ change_count: 0, diff: [] });

    render(
      <ApiContext.Provider value={{ api: mockApi }}>
        <DiffView
          diffType="HIGHLIGHTED_TEXT"
          page={simplePage}
          a={simplePage.versions[1]}
          b={simplePage.versions[0]}
        />
      </ApiContext.Provider>
    );

    await waitFor(() => screen.getByRole('alert'));
  });

  it('renders no alert if there are changes in the diff', async () => {
    render(
      <ApiContext.Provider value={{ api: mockApi }}>
        <DiffView
          diffType="HIGHLIGHTED_TEXT"
          page={simplePage}
          a={simplePage.versions[1]}
          b={simplePage.versions[0]}
        />
      </ApiContext.Provider>
    );

    await waitFor(() => expect(mockApi.getDiff).toHaveBeenCalled());
    expect(screen.queryByRole('alert')).toBeNull();
    screen.getByText('Hi');
  });
});
