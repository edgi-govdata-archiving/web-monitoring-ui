export const diffTypes = {
  HIGHLIGHTED_TEXT: {
    description: 'Highlighted Text',
    diff_service: 'html_text',
    value: 'HIGHLIGHTED_TEXT'
  },
  HIGHLIGHTED_SOURCE: {
    description: 'Highlighted Source',
    diff_service: 'html_source',
    value: 'HIGHLIGHTED_SOURCE'
  },
  HIGHLIGHTED_RENDERED: {
    description: 'Highlighted Rendered',
    diff_service: 'TODO',
    value: 'HIGHLIGHTED_RENDERED'
  },
  SIDE_BY_SIDE_RENDERED: {
    description: 'Side-by-Side Rendered',
    diff_service: 'html_source',  // HACK, real side-by-side doesn't exist yet
    value: 'SIDE_BY_SIDE_RENDERED'
  },
  SIDE_BY_SIDE_TEXT: {
    description: 'Side-by-Side Text',
    diff_service: 'TODO',
    value: 'SIDE_BY_SIDE_TEXT'
  },
  CHANGES_ONLY_TEXT: {
    description: 'Changes Only Text',
    diff_service: 'html_text',
    value: 'CHANGES_ONLY_TEXT'
  },
  CHANGES_ONLY_SOURCE: {
    description :'Changes Only Source',
    diff_service: 'html_source',
    value: 'CHANGES_ONLY_SOURCE'
  }
};
