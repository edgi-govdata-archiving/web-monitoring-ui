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
