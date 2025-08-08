/* eslint-env jest */

/**
 * @jest-environment jsdom
 */

import { diffTypesFor, diffTypes } from '../diff-types';
import MediaType, { parseMediaType } from '../../scripts/media-type';

describe('diff-types with file preview support', () => {
  describe('diffTypesFor non-renderable content', () => {
    it('returns file preview types for Excel files', () => {
      const types = diffTypesFor('.xlsx');

      expect(types).toContain(diffTypes.SIDE_BY_SIDE_FILE_PREVIEW);
      expect(types).toContain(diffTypes.FILE_PREVIEW);
      expect(types[0]).toBe(diffTypes.SIDE_BY_SIDE_FILE_PREVIEW);
    });

    it('returns file preview types for Word documents', () => {
      const types = diffTypesFor(MediaType('application', 'vnd.openxmlformats-officedocument.wordprocessingml.document'));

      expect(types).toContain(diffTypes.SIDE_BY_SIDE_FILE_PREVIEW);
      expect(types).toContain(diffTypes.FILE_PREVIEW);
    });

    it('returns file preview types for ZIP files', () => {
      const types = diffTypesFor(parseMediaType('application/zip'));

      expect(types).toContain(diffTypes.SIDE_BY_SIDE_FILE_PREVIEW);
      expect(types).toContain(diffTypes.FILE_PREVIEW);
    });

    it('returns file preview types for binary files', () => {
      const types = diffTypesFor(parseMediaType('application/octet-stream'));

      expect(types).toContain(diffTypes.SIDE_BY_SIDE_FILE_PREVIEW);
      expect(types).toContain(diffTypes.FILE_PREVIEW);
    });
  });

  describe('diffTypesFor renderable content', () => {
    it('returns traditional diff types for HTML', () => {
      const types = diffTypesFor(parseMediaType('text/html'));

      expect(types).not.toContain(diffTypes.SIDE_BY_SIDE_FILE_PREVIEW);
      expect(types).not.toContain(diffTypes.FILE_PREVIEW);
      expect(types).toContain(diffTypes.HIGHLIGHTED_TEXT);
    });

    it('returns traditional diff types for plain text', () => {
      const types = diffTypesFor(parseMediaType('text/plain'));

      expect(types).not.toContain(diffTypes.SIDE_BY_SIDE_FILE_PREVIEW);
      expect(types).not.toContain(diffTypes.FILE_PREVIEW);
      expect(types).toContain(diffTypes.HIGHLIGHTED_SOURCE);
    });

    it('returns traditional diff types for PDF', () => {
      const types = diffTypesFor(parseMediaType('application/pdf'));

      expect(types).not.toContain(diffTypes.SIDE_BY_SIDE_FILE_PREVIEW);
      expect(types).not.toContain(diffTypes.FILE_PREVIEW);
      expect(types).toContain(diffTypes.RAW_SIDE_BY_SIDE);
    });

    it('returns traditional diff types for JSON', () => {
      const types = diffTypesFor(parseMediaType('application/json'));

      expect(types).not.toContain(diffTypes.SIDE_BY_SIDE_FILE_PREVIEW);
      expect(types).not.toContain(diffTypes.FILE_PREVIEW);
      expect(types).toContain(diffTypes.RAW_SIDE_BY_SIDE);
    });

    it('returns traditional diff types for images', () => {
      const types = diffTypesFor(parseMediaType('image/png'));

      expect(types).not.toContain(diffTypes.SIDE_BY_SIDE_FILE_PREVIEW);
      expect(types).not.toContain(diffTypes.FILE_PREVIEW);
      expect(types).toContain(diffTypes.RAW_SIDE_BY_SIDE);
    });
  });
});
