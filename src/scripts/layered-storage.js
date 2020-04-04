'use strict';

/**
 * Wraps a DOMStorage instance (e.g. sessionStorage or localStorage) so that
 * you can save and load non-string values and so that you don't have to worry
 * about catching exceptions (e.g. if the storage quota is exceeded).
 */
export class SafeStorage {
  constructor (backingStore) {
    this.store = backingStore;
  }

  get length () { return this.store.length; }

  clear () { return this.store.clear(); }

  getItem (key) {
    const value = this.store.getItem(key);
    try {
      return (value == null || !value.length) ? value : JSON.parse(value);
    }
    catch (error) {
      return value;
    }
  }

  key (index) { return this.store.key(index); }

  removeItem (key) { return this.store.removeItem(key); }

  setItem (key, value) {
    const actualValue = JSON.stringify(value);
    try {
      this.store.setItem(key, actualValue);
      return true;
    }
    catch (error) {
      return false;
    }
  }
}

/**
 * Wrapper for a series of DOM Storage objects that saves data to all of them
 * and reads data from the topmost store.
 */
export class LayeredStorage {
  constructor (stores) {
    this.stores = stores;
  }

  getItem (key) {
    for (const store of this.stores) {
      const value = store.getItem(key);
      if (value != null) return value;
    }
  }

  setItem (key, value) {
    this.stores.reduce((success, store) => {
      try {
        store.setItem(key, value);
        return success;
      }
      catch (error) {
        return false;
      }
    }, true);
  }

  removeItem (key) {
    this.stores.forEach(store => store.removeItem(key));
  }

  clear () {
    this.stores.forEach(store => store.clear());
  }
}

/**
 * A DOM Storage instance that saves data in both session and local storage,
 * so new browser windows have the data, but reads data from session storage,
 * so concurrently open windows don't interfere with each other.
 */
export default new LayeredStorage([
  new SafeStorage(sessionStorage),
  new SafeStorage(localStorage)
]);
