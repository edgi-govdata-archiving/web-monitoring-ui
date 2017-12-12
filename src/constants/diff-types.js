export const diffTypes = {
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
    options: {include: 'all'}
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
  }
};

for (let key in diffTypes) {
  diffTypes[key].value = key;
}
