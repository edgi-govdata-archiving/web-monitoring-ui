/* tslint:disable interface-name */

// TODO: consider whether we need to support multiple ways to visualize a
// particular diff (e.g. render text diffs side-by-side or inline -- do those
// need separate diff type constants that correspond to the same diff algorithm,
// `html_text`)
export interface DiffTypes {
    [propName: string]: string;
}

export const diffTypes: DiffTypes = {
    HIGHLIGHTED_TEXT: 'highlighted text',
    HIGHLIGHTED_SOURCE: 'highlighted source',
    HIGLIGHTED_RENDERED: 'higlighted rendered',
    SIDE_BY_SIDE_RENDERED: 'side-by-side rendered',
    SIDE_BY_SIDE_TEXT: 'side-by-side text',
};

// TODO - map each diffType to it's corresponding endpoint string
export const changeDiffTypes = {
    [diffTypes.HIGHLIGHTED_TEXT]: 'html_text',
    // [diffTypes.HIGHLIGHTED_SOURCE]: 'html_source',
    [diffTypes.HIGHLIGHTED_SOURCE]: 'source',
    [diffTypes.SIDE_BY_SIDE_RENDERED]: 'html_source'  // HACK
};
