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

  describe('URL search params', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    function createMockSearchParams (params = {}) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.set(key, value);
      });
      return searchParams;
    }

    it('reads initial URL from search params', () => {
      const searchParams = createMockSearchParams({ url: 'epa' });
      const setSearchParams = jest.fn();
      const onSearch = jest.fn();

      renderContext(
        <PageList
          pages={simplePages}
          searchParams={searchParams}
          setSearchParams={setSearchParams}
          onSearch={onSearch}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search for a URL...');
      expect(searchInput).toHaveValue('epa');
    });

    it('reads initial dates from search params', () => {
      const searchParams = createMockSearchParams({
        startDate: '2025-01-15',
        endDate: '2025-06-30'
      });
      const setSearchParams = jest.fn();
      const onSearch = jest.fn();

      renderContext(
        <PageList
          pages={simplePages}
          searchParams={searchParams}
          setSearchParams={setSearchParams}
          onSearch={onSearch}
        />
      );

      const startDateInput = screen.getByLabelText(/from date/i);
      const endDateInput = screen.getByLabelText(/to date/i);
      expect(startDateInput).toHaveValue('2025-01-15');
      expect(endDateInput).toHaveValue('2025-06-30');
    });

    it('updates URL params when search is performed', async () => {
      const searchParams = createMockSearchParams();
      const setSearchParams = jest.fn();
      const onSearch = jest.fn();

      renderContext(
        <PageList
          pages={simplePages}
          searchParams={searchParams}
          setSearchParams={setSearchParams}
          onSearch={onSearch}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search for a URL...');
      fireEvent.change(searchInput, { target: { value: 'noaa' } });

      // Run SearchBar's debounce timer (500ms)
      await act(() => {
        jest.advanceTimersByTime(500);
      });

      // Run PageList's URL update debounce timer (500ms)
      await act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(setSearchParams).toHaveBeenCalled();
      const lastCall = setSearchParams.mock.calls[setSearchParams.mock.calls.length - 1];
      const [params, options] = lastCall;
      expect(params.get('url')).toBe('noaa');
      expect(options).toEqual({ replace: true });
    });

    it('clears URL params when search is cleared', async () => {
      const searchParams = createMockSearchParams({ url: 'epa' });
      const setSearchParams = jest.fn();
      const onSearch = jest.fn();

      renderContext(
        <PageList
          pages={simplePages}
          searchParams={searchParams}
          setSearchParams={setSearchParams}
          onSearch={onSearch}
        />
      );

      // Run timers to process initial URL param (triggered by componentDidMount)
      await act(() => {
        jest.advanceTimersByTime(500);
      });

      // Clear any calls from initial mount
      setSearchParams.mockClear();

      const searchInput = screen.getByPlaceholderText('Search for a URL...');
      fireEvent.change(searchInput, { target: { value: '' } });

      // Run SearchBar's debounce timer
      await act(() => {
        jest.advanceTimersByTime(500);
      });

      // Run PageList's URL update debounce timer
      await act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(setSearchParams).toHaveBeenCalled();
      const lastCall = setSearchParams.mock.calls[setSearchParams.mock.calls.length - 1];
      const [params] = lastCall;
      expect(params.get('url')).toBeNull();
    });

    it('handles invalid date in URL gracefully', () => {
      const searchParams = createMockSearchParams({
        startDate: 'invalid-date'
      });
      const setSearchParams = jest.fn();
      const onSearch = jest.fn();

      // Should not throw
      renderContext(
        <PageList
          pages={simplePages}
          searchParams={searchParams}
          setSearchParams={setSearchParams}
          onSearch={onSearch}
        />
      );

      const startDateInput = screen.getByLabelText(/from date/i);
      expect(startDateInput).toHaveValue('');
    });
  });
});
