export interface DiffTypes {
  [propName: string]: string;
}

export const diffTypes:DiffTypes = {
  HIGHLIGHTED_TEXT: 'highlighted text',
  HIGHLIGHTED_SOURCE: 'highlighted source',
  HIGLIGHTED_RENDERED: 'higlighted rendered', 
  SIDE_BY_SIDE_RENDERED: 'side-by-side rendered', 
  SIDE_BY_SIDE_TEXT: 'side-by-side text',
}

// TODO - map each diffType to it's corresponding endpoint string
export const changeDiffTypes = {
  [diffTypes.HIGHLIGHTED_TEXT] : "html_text",
}