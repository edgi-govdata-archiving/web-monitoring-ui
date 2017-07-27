import * as PropTypes from 'prop-types';
import * as React from 'react';
import WebMonitoringDb, {Page, Version} from '../services/web-monitoring-db';
import {diffTypes, changeDiffTypes} from '../constants/diff-types';

import HighlightedTextDiff from './highlighted-text-diff';
import SideBySideRenderedDiff from './side-by-side-rendered-diff';
export interface IDiffViewProps {
  page: Page;
  diffType: string;
  a: Version;
  b: Version;
}

// DiffView encapsulates fetching diffs, and wraps all different kinds of diff view types
export default class DiffView extends React.Component<IDiffViewProps,any> {
  static contextTypes = {
    api: PropTypes.instanceOf(WebMonitoringDb),
  };

  context: {api: WebMonitoringDb};

  constructor (props: IDiffViewProps) {
    super(props);
    this.state = {diff: null};
  }

  componentWillMount () {
    const { props } = this;
    if (this.canFetch(props)){
      this.loadDiff(props.page.uuid, props.a.uuid, props.b.uuid, props.diffType);
    }
  }

  componentWillReceiveProps (nextProps: IDiffViewProps) {
    if (this.canFetch(nextProps) && !this.propsSpecifySameDiff(nextProps)) {
      this.loadDiff(nextProps.page.uuid, nextProps.a.uuid, nextProps.b.uuid, nextProps.diffType);
    }
  }

  render () {
    const { a, b, diffType } = this.props;
    const { diff } = this.state;

    if (!diffType || !diffTypes[diffType] || !diff) {
      return null;
    }

    // TODO: if we have multiple ways to render content from a single service
    // in the future (e.g. inline vs. side-by-side text), we need a better
    // way to ensure we use the correct rendering and avoid race conditions
    switch (diff.diff_service) {
      case changeDiffTypes[diffTypes.SIDE_BY_SIDE_RENDERED]:
        return (
            <SideBySideRenderedDiff a={a} b={b} page={this.props.page} />
        );
       case changeDiffTypes[diffTypes.HIGHLIGHTED_TEXT]:
         return (
            <HighlightedTextDiff diff={diff} className="diff-text-inline" />
         );
       case changeDiffTypes[diffTypes.HIGHLIGHTED_SOURCE]:
         return (
            <HighlightedTextDiff diff={diff} className="diff-source-inline" />
         );
      default:
        return null;
    }
  }

  private propsSpecifySameDiff (newProps: IDiffViewProps, props?: IDiffViewProps) {
      props = props || this.props;
      return props.a.uuid === newProps.a.uuid
        && props.b.uuid === newProps.b.uuid
        && props.diffType === newProps.diffType;
  }

  // check to see if this props object has everything necessary to perform a fetch
  private canFetch (props: IDiffViewProps) {
    return (props.page.uuid && props.diffType && props.a && props.b && props.a.uuid && props.b.uuid);
  }

  private loadDiff (pageId: string, aId: string, bId: string, diffType: string) {
    // TODO - this seems to be some sort of caching mechanism, would be smart to have this for diffs
    // const fromList = this.props.pages && this.props.pages.find(
    //     (page: Page) => page.uuid === pageId);
    // Promise.resolve(fromList || this.context.api.getDiff(pageId, aId, bId, changeDiffTypes[diffType]))

    Promise.resolve(this.context.api.getDiff(pageId, aId, bId, changeDiffTypes[diffTypes[diffType]]))
        .then((diff: any) => {
            this.setState({diff});
        });
  }
}
