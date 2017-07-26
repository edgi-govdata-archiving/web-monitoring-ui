import * as React from 'react';
import {Page} from '../services/web-monitoring-db';

export default class SideBySideRenderedDiff extends React.Component<any, any> {
    private frameA: HTMLIFrameElement;
    private frameB: HTMLIFrameElement;

    // Simplistic rendering with remote content
    // render () {
    //     if (!this.props) {
    //         return null;
    //     }

    //     return (
    //         <div className="side-by-side-render">
    //             <iframe src={this.props.a.uri} sandbox="allow-forms allow-scripts" />
    //             <hr />
    //             <iframe src={this.props.b.uri} sandbox="allow-forms allow-scripts" />
    //         </div>
    //     );
    // }

    render () {
        if (!this.props) {
            return null;
        }

        return (
            <div className="side-by-side-render">
                <iframe sandbox="allow-forms allow-scripts" ref={frame => this.frameA = frame} />
                <hr />
                <iframe sandbox="allow-forms allow-scripts" ref={frame => this.frameB = frame} />
            </div>
        );
    }

    shouldComponentUpdate (nextProps: any, nextState: any) {
        return nextProps.a !== this.props.a || nextProps.b !== this.props.b;
    }

    componentDidMount () {
        this.updateContent();
    }

    componentDidUpdate () {
        this.updateContent();
    }

    private updateContent () {
        fetch(this.props.a.uri)
            .then(response => response.text())
            .then(rawSource => processSource(rawSource, this.props.page))
            .then(source => {
                this.frameA.setAttribute('srcdoc', source);
            });
        fetch(this.props.b.uri)
            .then(response => response.text())
            .then(rawSource => processSource(rawSource, this.props.page))
            .then(source => {
                this.frameB.setAttribute('srcdoc', source);
            });
    }
}

function processSource (source: string, page: Page) {
    // <meta charset> tags don't work unless they are first, so if one is
    // present, modify <head> content *after* it.
    const hasCharsetTag = /<meta charset[^>]+>/.test(source);
    const headMatcher = hasCharsetTag ? /<meta charset[^>]+>/ : /<head[^>]*>/;
    const result = source.replace(headMatcher, followTag => {
        return `${followTag}\n<base href="${page.url}">\n`;
    });

    return result;
}
