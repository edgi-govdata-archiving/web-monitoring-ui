import * as React from 'react';

export interface DiffViewProps {
    html: string
};

export default class DiffView extends React.Component<DiffViewProps, undefined> {
    render() {
        return <div>
            <em>Diff to be displayed here.</em>
        </div>
    }
}

function loadIframe(html_embed: string) {
    // inject html
    var iframe = document.getElementById('diff_view');
    iframe.setAttribute('srcdoc', html_embed);

    iframe.onload = function() {
        // inject diff.css to highlight <ins> and <del> elements
        var frm = (frames as any)['diff_view'].contentDocument;
        var otherhead = frm.getElementsByTagName("head")[0];
        var link = frm.createElement("link");
        link.setAttribute("rel", "stylesheet");
        link.setAttribute("type", "text/css");
        link.setAttribute("href", `${window.location.origin}/css/diff.css`);
        otherhead.appendChild(link);

        // set iframe height = frame content
        iframe.setAttribute('height',(iframe as any).contentWindow.document.body.scrollHeight);
    };
}
