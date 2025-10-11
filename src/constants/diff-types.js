import {
  mediaTypeForExtension,
  parseMediaType,
  unknownType
} from '../scripts/media-type.js';

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

  // Generic text types (including application/javascript, application/xml, etc.)
  'text/*': [
    diffTypes.HIGHLIGHTED_TEXT,
    diffTypes.HIGHLIGHTED_SOURCE,
    diffTypes.CHANGES_ONLY_TEXT,
    diffTypes.CHANGES_ONLY_SOURCE,
  ],

  // Treat application/javascript as a text-like type so it gets text diffs
  'application/javascript': [
    diffTypes.HIGHLIGHTED_TEXT,
    diffTypes.HIGHLIGHTED_SOURCE,
    diffTypes.CHANGES_ONLY_TEXT,
    diffTypes.CHANGES_ONLY_SOURCE,
  ],

  // Images should show file-preview options but also allow raw/download
  'image/*': [
    diffTypes.FILE_PREVIEW,
    diffTypes.SIDE_BY_SIDE_FILE_PREVIEW,
    diffTypes.RAW_FROM_CONTENT,
    diffTypes.RAW_TO_CONTENT,
    diffTypes.RAW_SIDE_BY_SIDE,
  ],

  // Audio and video are non-renderable inside the diff views here; prefer
  // file preview/download behavior but keep raw options available.
  'audio/*': [
    diffTypes.FILE_PREVIEW,
    diffTypes.SIDE_BY_SIDE_FILE_PREVIEW,
    diffTypes.RAW_FROM_CONTENT,
    diffTypes.RAW_TO_CONTENT,
    diffTypes.RAW_SIDE_BY_SIDE,
  ],

  'video/*': [
    diffTypes.FILE_PREVIEW,
    diffTypes.SIDE_BY_SIDE_FILE_PREVIEW,
    diffTypes.RAW_FROM_CONTENT,
    diffTypes.RAW_TO_CONTENT,
    diffTypes.RAW_SIDE_BY_SIDE,
  ],

  // Unknown/any type should prefer file preview so users are prompted to
  // download rather than showing raw content by default.
  '*/*': [
    diffTypes.SIDE_BY_SIDE_FILE_PREVIEW,
    diffTypes.FILE_PREVIEW,
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

  // Look up explicit mappings first, then fall back to the generic type
  // (e.g. "text/*", "image/*"), then finally to unknown. The mapping
  // object now contains entries for images, audio/video, and specific
  // application types where appropriate, so we don't need ad-hoc logic
  // here to decide whether something is renderable.
  return diffTypesByMediaType[type.essence]
    || diffTypesByMediaType[type.genericType]
    || diffTypesByMediaType[unknownType.essence]
    || [];
}
