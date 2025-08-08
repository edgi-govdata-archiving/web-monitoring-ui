import {
  mediaTypeForExtension,
  parseMediaType,
  unknownType
} from '../scripts/media-type';

export const diffTypes = {
  RAW_FROM_CONTENT: {
    description: '“From” Version',
  },
  RAW_TO_CONTENT: {
    description: '“To” Version',
  },
  RAW_SIDE_BY_SIDE: {
    description: 'Side-by-side Content',
  },
  HIGHLIGHTED_TEXT: {
    description: 'Highlighted Text',
    diffService: 'html_text_dmp',
  },
  HIGHLIGHTED_SOURCE: {
    description: 'Highlighted Source',
    diffService: 'html_source_dmp',
  },
  HIGHLIGHTED_RENDERED: {
    description: 'Highlighted Rendered',
    diffService: 'html_token',
  },
  SIDE_BY_SIDE_RENDERED: {
    description: 'Side-by-Side Rendered',
    diffService: 'html_token',
    options: { include: 'all' }
  },
  OUTGOING_LINKS: {
    description: 'Outgoing Links',
    diffService: 'links'
  },
  CHANGES_ONLY_TEXT: {
    description: 'Changes Only Text',
    diffService: 'html_text_dmp',
  },
  CHANGES_ONLY_SOURCE: {
    description: 'Changes Only Source',
    diffService: 'html_source_dmp',
  },
  FILE_PREVIEW: {
    description: 'File Preview',
  },
  SIDE_BY_SIDE_FILE_PREVIEW: {
    description: 'Side-by-Side File Preview',
  }
};

for (let key in diffTypes) {
  diffTypes[key].value = key;
}

/**
 * Check if a media type represents non-renderable content that should use
 * file preview instead of raw display.
 * @param {MediaType} mediaType
 * @returns {boolean}
 */
function isNonRenderableType (mediaType) {
  // Content types that browsers can typically render inline
  const renderableTypes = new Set([
    'text/html',
    'text/plain',
    'text/css',
    'text/javascript',
    'application/javascript',
    'application/json',
    'application/xml',
    'text/xml',
    'application/pdf', // PDFs can be displayed inline in most browsers
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/svg+xml',
    'image/webp',
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'video/mp4',
    'video/webm',
    'video/ogg'
  ]);

  // Check if this is a renderable type
  if (renderableTypes.has(mediaType.essence)) {
    return false;
  }

  // Check for generic types that might be renderable
  if (mediaType.type === 'text' && mediaType.subtype !== '*') {
    return false; // Most text types can be rendered
  }

  if (mediaType.type === 'image' && mediaType.subtype !== '*') {
    return false; // Most images can be rendered
  }

  // Everything else is considered non-renderable
  return true;
}

const diffTypesByMediaType = {
  'text/html': [
    diffTypes.HIGHLIGHTED_TEXT,
    diffTypes.HIGHLIGHTED_SOURCE,
    diffTypes.HIGHLIGHTED_RENDERED,
    diffTypes.SIDE_BY_SIDE_RENDERED,
    diffTypes.OUTGOING_LINKS,
    diffTypes.CHANGES_ONLY_TEXT,
    diffTypes.CHANGES_ONLY_SOURCE,
  ],

  'text/*': [
    diffTypes.HIGHLIGHTED_SOURCE,
    diffTypes.CHANGES_ONLY_SOURCE,
  ],

  '*/*': [
    diffTypes.RAW_SIDE_BY_SIDE,
    diffTypes.RAW_FROM_CONTENT,
    diffTypes.RAW_TO_CONTENT,
  ],
};

/**
 * Get appropriate diff types for a given kind of content.
 * @param {string|MediaType} mediaType The type of content to get. Can be a
 *   MediaType object, a content type/media type string, or a file extension.
 * @returns {Array<DiffType>}
 */
export function diffTypesFor (mediaType) {
  let type = null;
  if (typeof mediaType === 'string' && mediaType.startsWith('.')) {
    type = mediaTypeForExtension[mediaType] || unknownType;
  }
  else {
    type = parseMediaType(mediaType);
  }

  // Check if this is a non-renderable type that should use file preview
  if (isNonRenderableType(type)) {
    return [
      diffTypes.SIDE_BY_SIDE_FILE_PREVIEW,
      diffTypes.FILE_PREVIEW,
      diffTypes.RAW_SIDE_BY_SIDE,
      diffTypes.RAW_FROM_CONTENT,
      diffTypes.RAW_TO_CONTENT,
    ];
  }

  return diffTypesByMediaType[type.essence]
    || diffTypesByMediaType[type.genericType]
    || diffTypesByMediaType[unknownType.essence]
    || [];
}
