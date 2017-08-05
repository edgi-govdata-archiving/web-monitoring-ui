import * as React from 'react';
import {Page} from '../services/web-monitoring-db';

/**
 * @typedef {Object} SideBySideRenderedDiffProps
 * @property {Version} a The "from" version
 * @property {Version} b The "to" version
 */

/**
 * Display two versions of a page, side-by-side.
 *
 * @class SideBySideRenderedDiff
 * @extends {React.Component}
 * @params {SideBySideRenderedDiffProps} props
 */
export default class SideBySideRenderedDiff extends React.Component {
    constructor (props) {
        super(props);
        this.frameA = null;
        this.frameB = null;
    }

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
                <iframe sandbox="allow-forms allow-scripts" ref={frame => this.frameB = frame} />
            </div>
        );
    }

    /**
     * @param {SideBySideRenderedDiffProps} nextProps
     * @param {Object} nextState
     * @returns {boolean}
     */
    shouldComponentUpdate (nextProps, nextState) {
        return nextProps.a !== this.props.a || nextProps.b !== this.props.b;
    }

    componentDidMount () {
        this._updateContent();
    }

    componentDidUpdate () {
        this._updateContent();
    }

    _updateContent () {
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

/**
 * Process HTML source code so that it renders nicely. This includes things like
 * adding a `<base>` tag so subresources are properly fetched.
 *
 * @param {string} source
 * @param {Page} page
 * @returns {string}
 */
function processSource (source, page) {
    // <meta charset> tags don't work unless they are first, so if one is
    // present, modify <head> content *after* it.
    const hasCharsetTag = /<meta charset[^>]+>/.test(source);
    const headMatcher = hasCharsetTag ? /<meta charset[^>]+>/ : /<head[^>]*>/;
    const result = source.replace(headMatcher, followTag => {
        return `${followTag}\n<base href="${page.url}">\n`;
    });

    return result;
}
