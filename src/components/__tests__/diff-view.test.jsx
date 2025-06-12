/* eslint-env jest */

import { render, screen, waitFor } from '@testing-library/react';
import DiffView from '../diff-view';
import simplePage from '../../__mocks__/simple-page.json';
import { TestApiContextProvider } from '../../__mocks__/api-context-provider';
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
      <TestApiContextProvider api={mockApi}>
        <DiffView
          diffType="HIGHLIGHTED_TEXT"
          page={simplePage}
          a={simplePage.versions[1]}
          b={simplePage.versions[0]}
        />
      </TestApiContextProvider>
    );

    expect(container).not.toBeEmptyDOMElement();
  });

  it('renders an alert if there are no changes in the diff', async () => {
    const noChangeApi = {
      __proto__: WebMonitoringDb.prototype,
      ...mockApi,
      getDiff: jest.fn().mockResolvedValue({ change_count: 0, diff: [] })
    };

    render(
      <TestApiContextProvider api={noChangeApi}>
        <DiffView
          diffType="HIGHLIGHTED_TEXT"
          page={simplePage}
          a={simplePage.versions[1]}
          b={simplePage.versions[0]}
        />
      </TestApiContextProvider>
    );

    await waitFor(() => screen.getByText(/no changes for this diff/));
  });

  it('renders no alert if there are changes in the diff', async () => {
    render(
      <TestApiContextProvider api={mockApi}>
        <DiffView
          diffType="HIGHLIGHTED_TEXT"
          page={simplePage}
          a={simplePage.versions[1]}
          b={simplePage.versions[0]}
        />
      </TestApiContextProvider>
    );

    await waitFor(() => expect(mockApi.getDiff).toHaveBeenCalled());
    expect(screen.queryByText(/no changes for this diff/)).toBeNull();
    screen.getByText('Hi');
  });
});
