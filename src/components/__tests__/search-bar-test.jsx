/* eslint-env jest */

import React from 'react';
import {shallow} from 'enzyme';
import SearchBar from '../search-bar/search-bar';

describe('search-bar', () => {
  // Need to use a fake timer because the _dispatchSearch function is debounced
  jest.useFakeTimers();
  const onSearch = jest.fn();

  it('Renders the search-bar', () => {
    const searchBar = shallow(<SearchBar />);
    const searchBarInput = searchBar.find('input');
    expect(searchBarInput.prop('placeholder')).toBe('Search for a URL...');
  });

  it('Handles search queries with a protocol correctly', () => {
    const searchBar = shallow(<SearchBar onSearch={onSearch} />);
    const searchBarInput = searchBar.find('input');
    searchBarInput.simulate('change', {target: {value: 'http://epa'}});

    jest.runAllTimers();
    expect(onSearch).toHaveBeenCalledWith({url: 'http://epa*'});
  });

  it('Handles search queries without a protocol correctly', () => {
    const searchBar = shallow(<SearchBar onSearch={onSearch} />);
    const searchBarInput = searchBar.find('input');
    searchBarInput.simulate('change', {target: {value: 'epa'}});

    jest.runAllTimers();
    expect(onSearch).lastCalledWith({url: '*//epa*'});
  });
});
