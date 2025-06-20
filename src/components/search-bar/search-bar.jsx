import { Component } from 'react';
import styles from './search-bar.css';
import SearchDatePicker from '../search-date-picker/search-date-picker';

/** @typedef {import("luxon").DateTime} DateTime */

/**
 * @typedef SearchBarProps
 * @property {(SearchBarQuery) => void} onSearch
 */

/**
 * @typedef SearchBarQuery
 * @property {string} url
 * @property {Date} startDate
 * @property {Date} endDate
 */

/**
 * Renders inputs to handle page search for various fields such as url or capture time.
 * Calls onSearch function with SearchBarQuery when query state object is updated.
 *
 * @class SearchBar
 * @extends {Component}
 * @param {SearchBarProps} props
 */
export default class SearchBar extends Component {
  constructor (props) {
    super(props);
    this.state = {
      url: null,
      startDate: null,
      endDate: null
    };

    // enable inputIdSuffix to be passed in for testing purposes.
    this.inputIdSuffix = this.props.inputIdSuffix || Math.floor(Math.random() * 100).toString();
    this._handleUrlInput = this._handleUrlInput.bind(this);
    this._urlSearch = debounce(this._urlSearch.bind(this), 500);
    this._dateSearch = this._dateSearch.bind(this);
  }

  componentDidUpdate (previousProps, previousState) {
    const queryHasChanged = previousState.url !== this.state.url
      || previousState.startDate !== this.state.startDate
      || previousState.endDate !== this.state.endDate;

    if (queryHasChanged) {
      this.props.onSearch({
        url: this.state.url,
        startDate: this.state.startDate,
        endDate: this.state.endDate
      });
    }
  }

  /**
   * Gets called when user starts typing into search input field.
   * Calls _urlSearch with input value.
   * @private
   * @param {DOMEvent} event
   */
  _handleUrlInput (event) {
    this._urlSearch(event.target.value);
  }

  /**
   * Parses url to generate wildcard pattern for url search query.
   * Updates query state with url information.
   * @private
   * @param {String} url
   */
  _urlSearch (url) {
    if (url) {
      // If doesn't start with a protocol (or looks like it's going that way),
      // prefix with an asterisk.
      if (!/^(\*|\/\/|(h|ht|htt|https?|https?\/|https?\/\/))/.test(url)) {
        url = url = `*//${url}`;
      }
      // If the search is for a domain + TLD, return all paths under it.
      if (/^[\w:*]+(\/\/)?[^/]+$/.test(url)) {
        url = `${url}*`;
      }
    }

    this.setState({ url: url || null });
  }

  /**
   * Updates query state with date range information.
   *
   * @param {DateTime} startDate Luxon DateTime object from date picker
   * @param {DateTime} endDate Luxon DateTime object from date picker
   */
  _dateSearch ({ startDate, endDate }) {
    this.setState({ startDate, endDate });
  }

  render () {
    return (
      <div className={styles.searchBar}>
        <input
          className={styles.searchBarInput}
          type="text"
          placeholder="Search for a URL..."
          onChange={this._handleUrlInput}
        />
        <SearchDatePicker
          onDateSearch={this._dateSearch}
          startDate={this.state.startDate}
          endDate={this.state.endDate}
          inputIdSuffix={this.inputIdSuffix}
        />
      </div>
    );
  }
}

function debounce (func, delay) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
}
