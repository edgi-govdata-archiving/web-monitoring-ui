/* eslint-env jest */

import MediaType, {parseMediaType} from '../media-type';

describe('MediaType module', () => {
  test('MediaType objects have a mediaType and genericType', () => {
    const type = MediaType('type', 'subtype');
    expect(type.type).toBe('type');
    expect(type.subtype).toBe('subtype');
    expect(type.mediaType).toBe('type/subtype');
    expect(type.genericType).toBe('type/*');
  });

  test('MediaType objects with no subtype have a "*" subtype', () => {
    const type = MediaType('type');
    expect(type.type).toBe('type');
    expect(type.subtype).toBe('*');
    expect(type.mediaType).toBe('type/*');
    expect(type.genericType).toBe('type/*');
  });

  test('MediaType.equals should return true for two identical type instances', () => {
    const type = MediaType('type', 'subtype');
    const otherType = MediaType('type', 'subtype');
    expect(type.equals(otherType)).toBe(true);
  });

  test('MediaType.equals should return false for two non-identical type instances', () => {
    const type = MediaType('type', 'subtype');
    const otherType = MediaType('type', 'otherSubtype');
    expect(type.equals(otherType)).toBe(false);
  });

  test('parseMediaType should return a MediaType instance that matches a media type string', () => {
    const type = parseMediaType('type/subtype');
    expect(type.type).toBe('type');
    expect(type.subtype).toBe('subtype');
    expect(type.mediaType).toBe('type/subtype');
    expect(type.genericType).toBe('type/*');
  });

  test('parseMediaType should return the MediaType instance it receives if one is passed instead of a string', () => {
    const type = MediaType('type', 'subtype');
    const parsedType = parseMediaType(type);
    expect(parsedType).toBe(type);
  });

  test('parseMediaType should throw an error if it does not receive a string or MediaType', () => {
    expect(() => {
      parseMediaType(5);
    }).toThrow(TypeError);
  });

  test('parseMediaType should return a known canonical type if one matches the parsed type', () => {
    const type = parseMediaType('application/xhtml+xml');
    expect(type.mediaType).toBe('text/html');
    expect(type.exactType.mediaType).toBe('application/xhtml+xml');
  });

  test('parseMediaType should not return a canonical type if `canonicalize` is false', () => {
    const type = parseMediaType('application/xhtml+xml', false);
    expect(type.mediaType).toBe('application/xhtml+xml');
  });
});
