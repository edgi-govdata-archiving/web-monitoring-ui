/* eslint-env jest */

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

// describe('diff-types with file preview support', () => {
//   describe('diffTypesFor non-renderable content', () => {
//     it('returns file preview types for Excel files', () => {
//       const types = diffTypesFor('.xlsx');

//       expect(types).toContain(diffTypes.SIDE_BY_SIDE_FILE_PREVIEW);
//       expect(types[0]).toBe(diffTypes.SIDE_BY_SIDE_FILE_PREVIEW);
//     });

//     it('returns file preview types for Word documents', () => {
//       const types = diffTypesFor(MediaType('application', 'vnd.openxmlformats-officedocument.wordprocessingml.document'));

//       expect(types).toContain(diffTypes.SIDE_BY_SIDE_FILE_PREVIEW);
//       expect(types).toContain(diffTypes.FILE_PREVIEW);
//     });

//     it('returns file preview types for ZIP files', () => {
//       const types = diffTypesFor(parseMediaType('application/zip'));

//       expect(types).toContain(diffTypes.SIDE_BY_SIDE_FILE_PREVIEW);
//       expect(types).toContain(diffTypes.FILE_PREVIEW);
//     });

//     it('returns file preview types for binary files', () => {
//       const types = diffTypesFor(parseMediaType('application/octet-stream'));

//       expect(types).toContain(diffTypes.SIDE_BY_SIDE_FILE_PREVIEW);
//       expect(types).toContain(diffTypes.FILE_PREVIEW);
//     });
// });
// });
