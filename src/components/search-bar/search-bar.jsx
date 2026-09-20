import { useState, useRef, useCallback } from 'react';
import styles from './search-bar.css';
import SearchDatePicker from '../search-date-picker/search-date-picker';

/** @typedef {import("luxon").DateTime} DateTime */

/**
 * @typedef SearchBarProps
 * @property {(SearchBarQuery) => void} onSearch
 * @property {string} [inputIdSuffix] - ID suffix for inputs; can be set for testing
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
 * @param {SearchBarProps} props
 */
export default function SearchBar ({ onSearch, inputIdSuffix }) {
  const [url, setUrl] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Stable ID suffix for inputs; allow override for testing
  const idSuffixRef = useRef(inputIdSuffix || Math.floor(Math.random() * 100).toString());

  const isMounted = useRef(false);

  const processUrl = useCallback((rawUrl) => {
    if (rawUrl) {
      if (!/^(\*|\/\/|(h|ht|htt|https?|https?\/|https?\/\/))/.test(rawUrl)) {
        rawUrl = `*//${rawUrl}`;
      }
      if (/^[\w:*]+(\/\/)?[^/]+$/.test(rawUrl)) {
        rawUrl = `${rawUrl}*`;
      }
    }
    return rawUrl || null;
  }, []);

  // Call onSearch whenever the query changes, skipping the initial render
  // This replaces componentDidUpdate
  const prevState = useRef({ url, startDate, endDate });
  if (isMounted.current) {
    const queryHasChanged = prevState.current.url !== url
      || prevState.current.startDate !== startDate
      || prevState.current.endDate !== endDate;

    if (queryHasChanged) {
      prevState.current = { url, startDate, endDate };
      onSearch?.({ url, startDate, endDate });
    }
  }
  else {
    isMounted.current = true;
  }

  const urlSearch = useRef(debounce((rawUrl) => {
    setUrl(processUrl(rawUrl));
  }, 500));

  const handleUrlInput = useCallback((event) => {
    urlSearch.current(event.target.value);
  }, []);

  const handleDateSearch = useCallback(({ startDate: sd, endDate: ed }) => {
    setStartDate(sd);
    setEndDate(ed);
  }, []);

  return (
    <div className={styles.searchBar}>
      <input
        className={styles.searchBarInput}
        type="text"
        placeholder="Search for a URL..."
        onChange={handleUrlInput}
      />
      <SearchDatePicker
        onDateSearch={handleDateSearch}
        startDate={startDate}
        endDate={endDate}
        inputIdSuffix={idSuffixRef.current}
      />
    </div>
  );
}

function debounce (func, delay) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
}
