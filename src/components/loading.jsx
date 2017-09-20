import React from 'react';

export default class Loading extends React.Component {

  constructor () {
    super();
  }

  render () {
    return (<object type="image/svg+xml" data="/img/infinity-loader.svg" className="loading" />);
  }
}
