import React from 'react';

export default class Loading extends React.Component {

  constructor () {
    super();
  }

  render () {
    return (<img src="/img/infinity-loader.svg" className="loading" />);
  }
}
