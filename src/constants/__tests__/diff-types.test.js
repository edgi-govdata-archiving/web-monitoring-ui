import { diffTypes, diffTypesFor } from '../diff-types';
import MediaType from '../../scripts/media-type';

describe('diffTypesFor', () => {
  it('accepts a file extension', () => {
    const result = diffTypesFor('.html');
    expect(result).toContain(diffTypes.HIGHLIGHTED_RENDERED);
  });

  it('accepts a media type string', () => {
    const result = diffTypesFor('text/html');
    expect(result).toContain(diffTypes.HIGHLIGHTED_RENDERED);
  });

  it('accepts a MediaType object', () => {
    const result = diffTypesFor(MediaType('text', 'html'));
    expect(result).toContain(diffTypes.HIGHLIGHTED_RENDERED);
  });
});

describe('diff-types with side by side content support', () => {
  describe('diffTypesFor non-renderable content', () => {
    it('returns file preview types for Excel files', () => {
      const types = diffTypesFor('.xlsx');

      expect(types).toContain(diffTypes.SIDE_BY_SIDE_FILE_PREVIEW);
      expect(types[0]).toBe(diffTypes.SIDE_BY_SIDE_FILE_PREVIEW);
    });

    it('returns file preview types for audio ', () => {
      const types = diffTypesFor('audio/mpeg');

      expect(types).toContain(diffTypes.SIDE_BY_SIDE_FILE_PREVIEW);
      expect(types[0]).toBe(diffTypes.SIDE_BY_SIDE_FILE_PREVIEW);
    });

    it('returns file preview types for video ', () => {
      const types = diffTypesFor('video/mp4');

      expect(types).toContain(diffTypes.SIDE_BY_SIDE_FILE_PREVIEW);
      expect(types[0]).toBe(diffTypes.SIDE_BY_SIDE_FILE_PREVIEW);
    });

    it('returns file preview types for image files', () => {
      const types = diffTypesFor('image/png');

      expect(types).toContain(diffTypes.SIDE_BY_SIDE_FILE_PREVIEW);
    });
  });
});
