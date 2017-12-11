import React from 'react';
import SandboxedHtml from './sandboxed-html';

/**
 * @typedef {Object} InlineRenderedDiffProps
 * @property {Diff} diff The diff to render
 * @property {Page} page The page this diff pertains to
 */

/**
 * Display two versions of a page with their changes inline together.
 *
 * @class InlineRenderedDiff
 * @extends {React.Component}
 * @params {InlineRenderedDiffProps} props
 */
export default class InlineRenderedDiff extends React.Component {
  render () {
    return <SandboxedHtml html={this.props.diff.content.diff} baseUrl={this.props.page.url} />;
  }
}
