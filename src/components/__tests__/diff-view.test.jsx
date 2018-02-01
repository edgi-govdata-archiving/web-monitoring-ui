/* eslint-env jest */

import DiffView from '../diff-view';
import React from 'react';
import {shallow} from 'enzyme';
import simplePage from '../../__mocks__/simple-page.json';
import WebMonitoringDb from '../../services/web-monitoring-db';

describe('diff-view', () => {
  const mockApi = Object.assign(Object.create(WebMonitoringDb.prototype), {
    getDiff () {
      return new Promise(resolve => resolve({
        change_count: 1,
        diff: [[0, 'Hi'], [1, '!']]
      }));
    }
  });

  const waitForNextTurn = () => new Promise(resolve => setTimeout(resolve, 0));

  it('can render', () => {
    const diffView = shallow(
      <DiffView
        diffType="HIGHLIGHTED_TEXT"
        page={simplePage}
        a={simplePage.versions[1]}
        b={simplePage.versions[0]}
      />,
      {context: {api: mockApi}}
    );

    expect(diffView.exists()).toEqual(true);
    // It should always have rendered *something.*
    expect(diffView.get(0)).toBeTruthy();
  });

  it('renders an alert if there are no changes in the diff', () => {
    mockApi.getDiff = jest.fn().mockReturnValue(Promise.resolve({change_count: 0}));

    const diffView = shallow(
      <DiffView
        diffType="HIGHLIGHTED_TEXT"
        page={simplePage}
        a={simplePage.versions[1]}
        b={simplePage.versions[0]}
      />,
      {context: {api: mockApi}}
    );

    // Wait for diff to load, state to change, and re-render to occur.
    return waitForNextTurn().then(() => {
      expect(diffView.find('.diff-view__alert').length).toBe(1);
    });
  });

  it('renders no alert if there are changes in the diff', () => {
    mockApi.getDiff = jest.fn().mockReturnValue(Promise.resolve({change_count: 1}));

    const diffView = shallow(
      <DiffView
        diffType="HIGHLIGHTED_TEXT"
        page={simplePage}
        a={simplePage.versions[1]}
        b={simplePage.versions[0]}
      />,
      {context: {api: mockApi}}
    );

    // Wait for diff to load, state to change, and re-render to occur.
    return waitForNextTurn().then(() => {
      expect(diffView.find('.diff-view__alert').length).toBe(0);
    });
  });
});
