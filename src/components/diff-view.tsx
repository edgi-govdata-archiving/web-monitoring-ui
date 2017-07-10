import * as PropTypes from 'prop-types';
import * as React from 'react';
import WebMonitoringDb, {Version} from '../services/web-monitoring-db';
import {diffTypes, changeDiffTypes} from '../constants/DiffTypes';

import HighlightedTextDiff from './highlighted-text-diff';
import SideBySideRenderedDiff from './side-by-side-rendered-diff';
export interface IDiffViewProps {
  pageId: string;
  diffType:string;
  a: Version;
  b: Version;
}

// DiffView encapsulates fetching diffs, and wraps all different kinds of diff view types
export default class DiffView extends React.Component<IDiffViewProps,any> {
  static contextTypes = {
    api: PropTypes.instanceOf(WebMonitoringDb),
  };

  context: {api: WebMonitoringDb};

  constructor(props: IDiffViewProps) {
    super(props);
    this.state = { diff: null }
  }

  componentWillMount() {
    const { props } = this;
    if (this.canFetch(props)){
      this.loadDiff(props.pageId, props.a.uuid, props.b.uuid, props.diffType);
    }
  }

  componentWillReceiveProps(nextProps: IDiffViewProps) {
    if (this.canFetch(nextProps)) {
      this.loadDiff(nextProps.pageId, nextProps.a.uuid, nextProps.b.uuid, nextProps.diffType);
    }
  }

  render() {
    const { a, b, diffType } = this.props;
    const { diff } = this.state;

    if (!diffType || !diffTypes[diffType] || !diff) {
      return null;
    }

    switch (diffTypes[diffType]) {
      case diffTypes.SIDE_BY_SIDE_RENDERED:
        return (
            <SideBySideRenderedDiff a={a} b={b} />
        );
       case diffTypes.HIGHLIGHTED_TEXT:
         return (
            <HighlightedTextDiff diff={diff} />
         );
       case diffTypes.HIGHLIGHTED_SOURCE:
         return (
            <HighlightedTextDiff diff={diff} />
         );
      default:
        return null;
    }
  }

  // check to see if this props object has everything necessary to perform a fetch
  private canFetch(props:IDiffViewProps) {
    return (props.pageId && props.diffType && props.a && props.b && props.a.uuid && props.b.uuid);
  }

  private loadDiff(pageId: string, aId: string, bId: string, diffType: string) {
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
