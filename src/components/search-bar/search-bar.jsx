import React from 'react';
import './search-bar.css';

/**
 * @typedef SearchBarProps
 * @property {(any) => void} onSearch
 */

/**
 * Renders input to handle page url search functionality and calls search query.
 *
 * @class SearchBar
 * @extends {React.Component}
 * @param {SearchBarProps} props
 */
export default class SearchBar extends React.Component {
  constructor(props) {
    super(props);
    this._didSearch = this._didSearch.bind(this);
    this._dispatchSearch = debounce(this._dispatchSearch.bind(this), 500);
  }

  _didSearch (event) {
    this._dispatchSearch(event.target.value);
  }

  _dispatchSearch (url) {
    if (url) {
      // If doesn't start with a protocol (or looks like it's going that way),
      // prefix with an asterisk.
      if (!/^(\*|\/\/|(h|ht|htt|https?|https?\/|https?\/\/))/.test(url)) {
        url = url = `*//${url}`;
      }
      // If the search is for a domain + TLD, return all paths under it
      if (/^[\w:*]+(\/\/)?[^/]+$/.test(url)) {
        url = `${url}*`;
      }
    }
    if (this.props.onSearch) {
      const query = url ? {url} : null;
      this.props.onSearch(query);
    }
  }

  render() {
    return (
      <div className="row" styleName="search-bar">
        <input
          styleName="search-bar-input"
          type="text"
          placeholder="Search for a URL..."
          onChange={this._didSearch}
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
