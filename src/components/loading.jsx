import infinityLoaderPath from '../img/infinity-loader.svg';
import { Component } from 'react';

export default class Loading extends Component {
  render () {
    return (
      <div className="loading">
        <object type="image/svg+xml" data={infinityLoaderPath} />
      </div>
    );
  }
}
