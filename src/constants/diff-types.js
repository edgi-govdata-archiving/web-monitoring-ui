export const diffTypes = {
  HIGHLIGHTED_TEXT: {
    description: 'highlighted text',
    diff_service: 'html_text',
    value: 'HIGHLIGHTED_TEXT'
  },
  HIGHLIGHTED_SOURCE: {
    description: 'highlighted source',
    diff_service: 'html_source',
    value: 'HIGHLIGHTED_SOURCE'
  },
  HIGHLIGHTED_RENDERED: {
    description: 'highlighted rendered',
    diff_service: 'TODO',
    value: 'HIGHLIGHTED_RENDERED'
  },
  SIDE_BY_SIDE_RENDERED: {
    description: 'side-by-side rendered',
    diff_service: 'html_source',  // HACK, real side-by-side doesn't exist yet
    value: 'SIDE_BY_SIDE_RENDERED'
  },
  SIDE_BY_SIDE_TEXT: {
    description: 'side-by-side text',
    diff_service: 'TODO',
    value: 'SIDE_BY_SIDE_TEXT'
  },
  CHANGES_ONLY_TEXT: {
    description: 'changes only text',
    diff_service: 'html_text',
    value: 'CHANGES_ONLY_TEXT'
  },
  CHANGES_ONLY_SOURCE: {
    description :'changes only source',
    diff_service: 'html_source',
    value: 'CHANGES_ONLY_SOURCE'
  }
};
