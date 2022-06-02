/* eslint-env jest */

import { shallow, mount } from 'enzyme';
import SearchBar from '../search-bar/search-bar';
import moment from 'moment';

describe('search-bar', () => {
  // Need to use a fake timer because the _urlSearch function is debounced.
  jest.useFakeTimers();

  it('Renders the search-bar', () => {
    const searchBar = shallow(<SearchBar />);
    const searchBarInput = searchBar.find('input');
    expect(searchBarInput.prop('placeholder')).toBe('Search for a URL...');
  });

  it('Handles search queries with a protocol correctly', () => {
    const onSearch = jest.fn();
    const searchBar = shallow(<SearchBar onSearch={onSearch} />);
    const searchBarInput = searchBar.find('input');
    searchBarInput.simulate('change', { target: { value: 'http://epa' } });

    jest.runAllTimers();
    expect(onSearch).toHaveBeenCalledWith({
      url: 'http://epa*',
      startDate: null,
      endDate: null
    });
  });

  it('Handles search queries without a protocol correctly', () => {
    const onSearch = jest.fn();
    const searchBar = shallow(<SearchBar onSearch={onSearch} />);
    const searchBarInput = searchBar.find('input');
    searchBarInput.simulate('change', { target: { value: 'epa' } });

    jest.runAllTimers();
    expect(onSearch).toHaveBeenCalledWith({
      url: '*//epa*',
      startDate: null,
      endDate: null
    });
  });

  it('Handles date range search queries for startDate', () => {
    const onSearch = jest.fn();
    const searchBar = mount(<SearchBar inputIdSuffix="1" onSearch={onSearch} />);
    searchBar.find('input#startDate1').simulate('focus');

    searchBar.find('.CalendarDay.CalendarDay_1').first().simulate('click');
    expect(onSearch).toHaveBeenCalledWith({
      url: null,
      startDate: expect.any(moment),
      endDate: null
    });
  });

  it('Handles date range search queries for endDate', () => {
    const onSearch = jest.fn();
    const searchBar = mount(<SearchBar inputIdSuffix="1" onSearch={onSearch} />);

    searchBar.find('input#endDate1').simulate('focus');
    searchBar.find('.CalendarDay.CalendarDay_1').first().simulate('click');
    expect(onSearch).toHaveBeenCalledWith({
      url: null,
      startDate: null,
      endDate: expect.any(moment)
    });
  });
});
