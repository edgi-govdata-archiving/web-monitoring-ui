/* eslint-env jest */

import { render, screen, fireEvent } from '@testing-library/react';
import SearchBar from '../search-bar/search-bar';
import moment from 'moment';

describe('search-bar', () => {
  // Need to use a fake timer because the _urlSearch function is debounced.
  jest.useFakeTimers();

  it('Renders the search-bar', () => {
    render(<SearchBar />);
    const searchBarInput = screen.getByPlaceholderText('Search for a URL...');
    expect(searchBarInput).toBeInTheDocument();
  });

  it('Handles search queries with a protocol correctly', () => {
    const onSearch = jest.fn();
    render(<SearchBar onSearch={onSearch} />);
    const searchBarInput = screen.getByPlaceholderText('Search for a URL...');

    fireEvent.change(searchBarInput, { target: { value: 'http://epa' } });
    jest.runAllTimers();

    expect(onSearch).toHaveBeenCalledWith({
      url: 'http://epa*',
      startDate: null,
      endDate: null
    });
  });

  it('Handles search queries without a protocol correctly', () => {
    const onSearch = jest.fn();
    render(<SearchBar onSearch={onSearch} />);
    const searchBarInput = screen.getByPlaceholderText('Search for a URL...');

    fireEvent.change(searchBarInput, { target: { value: 'epa' } });
    jest.runAllTimers();

    expect(onSearch).toHaveBeenCalledWith({
      url: '*//epa*',
      startDate: null,
      endDate: null
    });
  });

  it('Handles date range search queries for startDate', () => {
    const onSearch = jest.fn();
    render(<SearchBar inputIdSuffix="1" onSearch={onSearch} />);
    
    // To open and interact with the calendar, we first need to focus the input it's attached to.
    const startDateInput = screen.getByLabelText(/start date/i);
    fireEvent.focus(startDateInput);

    // The actual button text is something like "Choose Sunday, June 1, 2025, blah blah".
    // This should get us close enough. There will be more than one (for the current and previous month).
    const calendarDay = screen.getAllByRole('button', { name: /Choose .* 1,/ });
    fireEvent.click(calendarDay[0]);

    expect(onSearch).toHaveBeenCalledWith({
      url: null,
      startDate: expect.any(moment),
      endDate: null
    });
  });

  it('Handles date range search queries for endDate', () => {
    const onSearch = jest.fn();
    render(<SearchBar inputIdSuffix="1" onSearch={onSearch} />);
    
    const endDateInput = screen.getByLabelText(/end date/i);
    fireEvent.focus(endDateInput);

    // The actual button text is something like "Choose Sunday, June 1, 2025, blah blah".
    // This should get us close enough. There will be more than one (for the current and previous month).
    const calendarDay = screen.getAllByRole('button', { name: /Choose .* 1,/ });
    fireEvent.click(calendarDay[0]);

    expect(onSearch).toHaveBeenCalledWith({
      url: null,
      startDate: null,
      endDate: expect.any(moment)
    });
  });
});
