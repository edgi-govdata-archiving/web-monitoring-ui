export const diffTypes = {
  HIGHLIGHTED_TEXT: {
    description: 'Highlighted Text',
    diffService: 'html_text',
  },
  HIGHLIGHTED_SOURCE: {
    description: 'Highlighted Source',
    diffService: 'html_source',
  },
  HIGHLIGHTED_RENDERED: {
    description: 'Highlighted Rendered',
    diffService: 'html_visual',
  },
  SIDE_BY_SIDE_RENDERED: {
    description: 'Side-by-Side Rendered',
    diffService: 'html_visual'
  },
  CHANGES_ONLY_TEXT: {
    description: 'Changes Only Text',
    diffService: 'html_text',
  },
  CHANGES_ONLY_SOURCE: {
    description: 'Changes Only Source',
    diffService: 'html_source',
  }
};

for (let key in diffTypes) {
  diffTypes[key].value = key;
}
