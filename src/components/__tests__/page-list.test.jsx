import { fireEvent, render, screen, act } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router';
import PageList from '../page-list/page-list';
import simplePages from '../../__mocks__/simple-pages.json';

describe('page-list', () => {
  let globalOpen;

  beforeEach(() => {
    globalOpen = globalThis.open;
  });

  afterEach(() => {
    globalThis.open = globalOpen;
  });

  // Change string values to date objects so they're parsed correctly
  simplePages.forEach(record => {
    record.latest.capture_time = new Date(record.latest.capture_time);
  });

  function renderContext (element, options) {
    return render(
      (
        <Router>
          {element}
        </Router>
      ),
      options
    );
  }

  it('can render', () => {
    const { container } = renderContext(
      <PageList />
    );

    expect(container).not.toBeEmptyDOMElement();
  });

  it('shows domain without www prefix', () => {
    renderContext(<PageList pages={simplePages} />);
    screen.getByText('ncei.noaa.gov');
  });

  it('shows non-URL related tags', () => {
    const { container } = renderContext(<PageList pages={simplePages} />);

    const tagsCell = container.querySelector('tbody tr:nth-child(1) td:nth-child(4)');
    expect(tagsCell).toHaveTextContent('Human');
  });

  it('displays SearchBar component', () => {
    renderContext(<PageList />);
    expect(screen.getByPlaceholderText('Search for a URL...')).toBeInTheDocument();
  });

  it('displays Loading component when there are no pages', () => {
    renderContext(<PageList />);
    screen.getByText(/loading/i);
  });

  it('does not display Loading component when there are pages', () => {
    renderContext(<PageList pages={simplePages} />);
    expect(screen.queryByText(/loading/i)).toBeNull();
  });

  it('opens a new window when a user control clicks on a page row', async () => {
    globalThis.open = jest.fn();
    renderContext(<PageList pages={simplePages} />);

    const page = simplePages[0];
    await act(() => {
      const row = screen.getByRole('link', { name: page.url }).closest('tr');
      fireEvent.click(row, { ctrlKey : true });
    });

    expect(globalThis.open.mock.calls[0][0]).toBe(`/page/${page.uuid}`);
    expect(globalThis.open.mock.calls[0][1]).toBe('_blank');
  });

  it('opens a new window when a user command clicks on a page row', async () => {
    globalThis.open = jest.fn();
    renderContext(<PageList pages={simplePages} />);

    const page = simplePages[0];
    await act(() => {
      const row = screen.getByRole('link', { name: page.url }).closest('tr');
      fireEvent.click(row, { metaKey : true });
    });

    expect(globalThis.open.mock.calls.length).toBe(1);
  });
});
