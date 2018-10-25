/* eslint-env jest */

import {SafeStorage, LayeredStorage} from '../layered-storage';

describe('LayeredStorage module', () => {
  describe('SafeStorage class', () => {
    test('SafeStorage should call through to getItem()', () => {
      const data = {whatever: 'example'};
      const storage = new SafeStorage({
        getItem (key) { return data[key]; }
      });

      expect(storage.getItem('whatever')).toEqual('example');
    });

    test('SafeStorage should call through to setItem()', () => {
      const data = {};
      const storage = new SafeStorage({
        setItem (key, value) { data[key] = value; }
      });

      storage.setItem('whatever', 'example');
      expect(data).toHaveProperty('whatever', '"example"');
    });

    test('SafeStorage should not throw on setItem', () => {
      const storage = new SafeStorage({
        setItem () {
          throw new DOMException('Cannot store stuff for some reason');
        }
      });

      expect(storage.setItem('whatever')).toEqual(false);
    });

    test('SafeStorage should call through to clear()', () => {
      let cleared = false;
      const storage = new SafeStorage({
        clear () { cleared = true; }
      });

      storage.clear();
      expect(cleared).toEqual(true);
    });

    test('SafeStorage should call through to removeItem()', () => {
      let calledWith = null;
      const storage = new SafeStorage({
        removeItem (key) { calledWith = key; }
      });

      storage.removeItem('whatever');
      expect(calledWith).toEqual('whatever');
    });

    test('SafeStorage should serialize objects', () => {
      let storedValue = null;
      const storage = new SafeStorage({
        setItem (key, value) { storedValue = value; }
      });

      storage.setItem('whatever', {somekey: 'somevalue'});
      expect(storedValue).toEqual('{"somekey":"somevalue"}');
    });

    test('SafeStorage should deserialize objects', () => {
      const storage = new SafeStorage({
        getItem (key) { return '{"somekey":"somevalue"}'; }
      });

      expect(storage.getItem('whatever')).toEqual({somekey: 'somevalue'});
    });

    test('SafeStorage should not fail on non-JSON data', () => {
      const storage = new SafeStorage({
        getItem (key) { return 'Plain old string'; }
      });

      expect(storage.getItem('whatever')).toEqual('Plain old string');
    });
  });

  describe('LayeredStorage class', () => {
    test('LayeredStorage should getItem() from the first with a value', () => {
      const storage = new LayeredStorage([
        { getItem (key) { return null; } },
        { getItem (key) { return 'a'; } },
        { getItem (key) { return 'b'; } }
      ]);

      expect(storage.getItem('whatever')).toEqual('a');
    });

    test('LayeredStorage should setItem() on all layers', () => {
      const called = [];
      const storage = new LayeredStorage([
        { setItem (key) { called.push('a'); } },
        { setItem (key) { called.push('b'); } },
        { setItem (key) { called.push('c'); } }
      ]);

      storage.setItem('whatever');
      expect(called).toEqual(['a', 'b', 'c']);
    });
  });
});
