import { render, screen, fireEvent, act } from '@testing-library/react';
import SearchBar from '../search-bar/search-bar';
import { DateTime } from 'luxon';

describe('search-bar', () => {
  beforeEach(() => {
    // Need to use a fake timer because the _urlSearch function is debounced.
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('Renders the search-bar', () => {
    render(<SearchBar />);
    const searchBarInput = screen.getByPlaceholderText('Search for a URL...');
    expect(searchBarInput).toBeInTheDocument();
  });

  it('Handles search queries with a protocol correctly', async () => {
    const onSearch = jest.fn();
    render(<SearchBar onSearch={onSearch} />);

    await act(() => {
      const searchBarInput = screen.getByPlaceholderText('Search for a URL...');
      fireEvent.change(searchBarInput, { target: { value: 'http://epa' } });
      jest.runAllTimers();
    });

    expect(onSearch).toHaveBeenCalledWith({
      url: 'http://epa*',
      startDate: null,
      endDate: null
    });
  });

  it('Handles search queries without a protocol correctly', async () => {
    const onSearch = jest.fn();
    render(<SearchBar onSearch={onSearch} />);

    await act(() => {
      const searchBarInput = screen.getByPlaceholderText('Search for a URL...');
      fireEvent.change(searchBarInput, { target: { value: 'epa' } });
      jest.runAllTimers();
    });

    expect(onSearch).toHaveBeenCalledWith({
      url: '*//epa*',
      startDate: null,
      endDate: null
    });
  });

  it('Handles date range search queries for startDate', async () => {
    const onSearch = jest.fn();
    render(<SearchBar onSearch={onSearch} />);

    await act(() => {
      const startDateInput = screen.getByLabelText(/from date/i);
      fireEvent.change(startDateInput, { target: { value: '2025-06-01' } });
    });

    expect(onSearch).toHaveBeenCalledWith({
      url: null,
      startDate: expect.any(DateTime),
      endDate: null
    });
  });

  it('Handles date range search queries for endDate', async () => {
    const onSearch = jest.fn();
    render(<SearchBar onSearch={onSearch} />);

    await act(() => {
      const endDateInput = screen.getByLabelText(/to date/i);
      fireEvent.change(endDateInput, { target: { value: '2025-06-01' } });
    });

    expect(onSearch).toHaveBeenCalledWith({
      url: null,
      startDate: null,
      endDate: expect.any(DateTime)
    });
  });

  describe('initial values', () => {
    it('populates URL input with initialUrl', () => {
      const onSearch = jest.fn();
      render(<SearchBar onSearch={onSearch} initialUrl="epa" />);

      const searchBarInput = screen.getByPlaceholderText('Search for a URL...');
      expect(searchBarInput).toHaveValue('epa');
    });

    it('triggers search on mount when initialUrl is provided', async () => {
      const onSearch = jest.fn();

      await act(async () => {
        render(<SearchBar onSearch={onSearch} initialUrl="epa" />);
      });

      expect(onSearch).toHaveBeenCalledWith({
        url: '*//epa*',
        startDate: null,
        endDate: null
      });
    });

    it('triggers search on mount when initialStartDate is provided', async () => {
      const onSearch = jest.fn();
      const startDate = DateTime.fromISO('2025-01-15');

      await act(async () => {
        render(<SearchBar onSearch={onSearch} initialStartDate={startDate} />);
      });

      expect(onSearch).toHaveBeenCalledWith({
        url: null,
        startDate: startDate,
        endDate: null
      });
    });

    it('triggers search on mount when initialEndDate is provided', async () => {
      const onSearch = jest.fn();
      const endDate = DateTime.fromISO('2025-06-30');

      await act(async () => {
        render(<SearchBar onSearch={onSearch} initialEndDate={endDate} />);
      });

      expect(onSearch).toHaveBeenCalledWith({
        url: null,
        startDate: null,
        endDate: endDate
      });
    });

    it('triggers search on mount with all initial values', async () => {
      const onSearch = jest.fn();
      const startDate = DateTime.fromISO('2025-01-15');
      const endDate = DateTime.fromISO('2025-06-30');

      await act(async () => {
        render(
          <SearchBar
            onSearch={onSearch}
            initialUrl="epa"
            initialStartDate={startDate}
            initialEndDate={endDate}
          />
        );
      });

      // URL search triggers with dates from state
      expect(onSearch).toHaveBeenCalledWith({
        url: '*//epa*',
        startDate: startDate,
        endDate: endDate
      });
    });
  });
});
