import * as React from 'react';

export interface IAnnotationLoadingProps {}

export default class Loading extends React.Component<IAnnotationLoadingProps, null> {

    constructor () {
        super();
    }

  render () {
        return (<div className="loading">&nbsp;</div>)
    }
}
