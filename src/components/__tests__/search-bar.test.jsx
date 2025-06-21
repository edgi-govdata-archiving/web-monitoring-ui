/* eslint-env jest */

import { render, screen, fireEvent, act } from '@testing-library/react';
import SearchBar from '../search-bar/search-bar';
import { DateTime } from 'luxon';

describe('search-bar', () => {
  // Need to use a fake timer because the _urlSearch function is debounced.
  jest.useFakeTimers();

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
});
