export const diffTypes = {
  HIGHLIGHTED_TEXT: {
    description: 'Highlighted Text',
    diffService: 'html_text',
    value: 'HIGHLIGHTED_TEXT'
  },
  HIGHLIGHTED_SOURCE: {
    description: 'Highlighted Source',
    diffService: 'html_source',
    value: 'HIGHLIGHTED_SOURCE'
  },
  HIGHLIGHTED_RENDERED: {
    description: 'Highlighted Rendered',
    diffService: 'TODO',
    value: 'HIGHLIGHTED_RENDERED'
  },
  SIDE_BY_SIDE_RENDERED: {
    description: 'Side-by-Side Rendered',
    diffService: 'html_source',  // HACK, real side-by-side doesn't exist yet
    value: 'SIDE_BY_SIDE_RENDERED'
  },
  SIDE_BY_SIDE_TEXT: {
    description: 'Side-by-Side Text',
    diffService: 'TODO',
    value: 'SIDE_BY_SIDE_TEXT'
  },
  CHANGES_ONLY_TEXT: {
    description: 'Changes Only Text',
    diffService: 'html_text',
    value: 'CHANGES_ONLY_TEXT'
  },
  CHANGES_ONLY_SOURCE: {
    description: 'Changes Only Source',
    diffService: 'html_source',
    value: 'CHANGES_ONLY_SOURCE'
  }
};
