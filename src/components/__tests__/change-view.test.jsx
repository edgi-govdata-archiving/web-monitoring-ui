/* eslint-env jest */

import React from 'react';
import {shallow} from 'enzyme';
import ChangeView, {defaultDiffType, diffTypeStorage} from '../change-view/change-view';
import layeredStorage from '../../scripts/layered-storage';
import simplePage from '../../__mocks__/simple-page.json';
import WebMonitoringDb from '../../services/web-monitoring-db';
import {diffTypesFor} from '../../constants/diff-types';

jest.mock('../../scripts/layered-storage', () => ({
  __esModule: true,
  default: {
    getItem (key) { return this._data[key]; },
    setItem (key, value) { return this._data[key] = value; },
    removeItem (key) { return delete this._data[key]; },
    clear () { this._data = {}; },
    _data: {}
  }
}));

const mockChange = {
  uuid: 'adc70e01-0723-4a28-a8e4-ca4b551ed2ae..0772dc83-7966-4881-8901-eceb051b9536',
  uuid_from: 'adc70e01-0723-4a28-a8e4-ca4b551ed2ae',
  uuid_to: '0772dc83-7966-4881-8901-eceb051b9536',
  priority: null,
  current_annotation: {},
  created_at: null,
  updated_at: null,
  significance: null
};

// Note for testing relevant diffTypes:
// the defaultDiffType (SIDE_BY_SIDE_RENDERED) is only relevant for the "text/html" media type
// the relevant types for "text/*" are a subset of the relevant types for "text/html"
// the relevant types for 'text/html' and "*/*" are mutually exclusive

describe('change-view', () => {
  const mockApi = Object.assign(
    Object.create(WebMonitoringDb.prototype),
    {getChange: () => Promise.resolve(mockChange)}
  );

  afterEach(() => {
    layeredStorage.clear();
  });

  describe('initial diffType', () => {
    describe('when a diffType has been stored in layeredStorage', () => {
      describe('when that diffType is relevant to the pages being compared', () => {
        it('sets state.diffType to the stored value', () => {
          const storedDiffType = 'CHANGES_ONLY_TEXT';
          layeredStorage.setItem(diffTypeStorage, storedDiffType);

          const changeView = shallow(
            <ChangeView
              page={simplePage}
              from={{content_type: 'text/html'}}
              to={{content_type: 'text/html'}}
              user={{email: 'me'}}
            />,
            {context: {api: mockApi}}
          );

          expect(changeView.state().diffType).toBe(storedDiffType);
        });
      });

      describe('when that diffType is NOT relevant to the pages being compared', () => {
        describe('when defaultDiffType (SIDE_BY_SIDE_RENDERED) is relevant to the pages being compared', () => {
          it('sets state.diffType to SIDE_BY_SIDE_RENDERED', () => {
            const storedDiffType = 'IRRELEVANT_DIFF_TYPE';
            layeredStorage.setItem(diffTypeStorage, storedDiffType);

            const changeView = shallow(
              <ChangeView
                page={simplePage}
                from={{content_type: 'text/html'}}
                to={{content_type: 'text/html'}}
                user={{email: 'me'}}
              />,
              {context: {api: mockApi}}
            );

            expect(changeView.state().diffType).toBe(defaultDiffType);
          });
        });

        describe('when defaultDiffType (SIDE_BY_SIDE_RENDERED) is NOT relevant to the pages being compared', () => {
          it('sets state.diffType to the first relevant diff type', () => {
            const storedDiffType = 'IRRELEVANT_DIFF_TYPE';
            layeredStorage.setItem(diffTypeStorage, storedDiffType);

            const mediaType = 'text/xml';
            const relevantTypes = diffTypesFor(mediaType);

            const changeView = shallow(
              <ChangeView
                page={simplePage}
                from={{content_type: mediaType}}
                to={{content_type: mediaType}}
                user={{email: 'me'}}
              />,
              {context: {api: mockApi}}
            );

            expect(changeView.state().diffType).toBe(relevantTypes[0].value);
          });
        });
      });
    });

    describe('when a diffType has NOT been stored in layeredStorage', () => {
      describe('when defaultDiffType (SIDE_BY_SIDE_RENDERED) is relevant to the pages being compared', () => {
        it('sets state.diffType to defaultDiffType', () => {
          const changeView = shallow(
            <ChangeView
              page={simplePage}
              from={{content_type: 'text/html'}}
              to={{content_type: 'text/html'}}
              user={{email: 'me'}}
            />,
            {context: {api: mockApi}}
          );

          expect(changeView.state().diffType).toBe(defaultDiffType);
        });
      });

      describe('when defaultDiffType (SIDE_BY_SIDE_RENDERED) is NOT relevant to the pages being compared', () => {
        it('sets state.diffType to the first relevant diff type', () => {
          const mediaType = 'text/xml';
          const relevantTypes = diffTypesFor(mediaType);

          const changeView = shallow(
            <ChangeView
              page={simplePage}
              from={{content_type: mediaType}}
              to={{content_type: mediaType}}
              user={{email: 'me'}}
            />,
            {context: {api: mockApi}}
          );

          expect(changeView.state().diffType).toBe(relevantTypes[0].value);
        });
      });
    });
  });

  describe('when the page versions change via props', () => {
    describe('when state.diffType is relevant to the new pages being compared', () => {
      it('leaves state.diffType at its current value', () => {

        const oldMediaType = 'text/xml';
        const newMediaType = 'text/html';

        const diffType = diffTypesFor(oldMediaType)[0].value;

        const changeView = shallow(
          <ChangeView
            page={simplePage}
            from={{content_type: oldMediaType}}
            to={{content_type: oldMediaType}}
            user={{email: 'me'}}
          />,
          {context: {api: mockApi}}
        );

        changeView.setProps({
          from: {content_type: newMediaType},
          to: {content_type: newMediaType},
        });

        expect(changeView.state().diffType).toBe(diffType);
      });
    });

    describe('when state.diffType is NOT relevant to the new pages being compared', () => {
      describe('when a diffType has been stored in layeredStorage', () => {
        describe('when that diffType is relevant to the pages being compared', () => {
          it('sets state.diffType to the stored value', () => {
            const oldMediaType = 'text/html';
            const newMediaType = 'image/jpeg';

            const storedDiffType = diffTypesFor(newMediaType)[1].value;

            layeredStorage.setItem(diffTypeStorage, storedDiffType);

            const changeView = shallow(
              <ChangeView
                page={simplePage}
                from={{content_type: oldMediaType}}
                to={{content_type: oldMediaType}}
                user={{email: 'me'}}
              />,
              {context: {api: mockApi}}
            );

            changeView.setProps({
              from: {content_type: newMediaType},
              to: {content_type: newMediaType},
            });

            expect(changeView.state().diffType).toBe(storedDiffType);
          });
        });

        describe('when the stored diffType is NOT relevant to the pages being compared', () => {
          describe('when defaultDiffType (SIDE_BY_SIDE_RENDERED) is relevant to the pages being compared', () => {
            it('sets state.diffType to defaultDiffType', () => {
              const oldMediaType = 'image/jpeg';
              const newMediaType = 'text/html';

              const storedDiffType = 'IRRELEVANT_DIFF_TYPE';
              layeredStorage.setItem(diffTypeStorage, storedDiffType);

              const changeView = shallow(
                <ChangeView
                  page={simplePage}
                  from={{content_type: oldMediaType}}
                  to={{content_type: oldMediaType}}
                  user={{email: 'me'}}
                />,
                {context: {api: mockApi}}
              );

              changeView.setProps({
                from: {content_type: newMediaType},
                to: {content_type: newMediaType},
              });

              expect(changeView.state().diffType).toBe(defaultDiffType);
            });
          });

          describe('when defaultDiffType (SIDE_BY_SIDE_RENDERED) is NOT relevant to the pages being compared', () => {
            it('sets state.diffType to the first relevant diff type', () => {
              const oldMediaType = 'text/html';
              const newMediaType = 'image/jpeg';

              const storedDiffType = 'IRRELEVANT_DIFF_TYPE';
              layeredStorage.setItem(diffTypeStorage, storedDiffType);

              const changeView = shallow(
                <ChangeView
                  page={simplePage}
                  from={{content_type: oldMediaType}}
                  to={{content_type: oldMediaType}}
                  user={{email: 'me'}}
                />,
                {context: {api: mockApi}}
              );

              changeView.setProps({
                from: {content_type: newMediaType},
                to: {content_type: newMediaType},
              });

              expect(changeView.state().diffType).toBe(diffTypesFor(newMediaType)[0].value);
            });
          });
        });
      });
    });

    describe('when a diffType has NOT been stored in layeredStorage', () => {
      describe('when defaultDiffType (SIDE_BY_SIDE_RENDERED) is relevant to the pages being compared', () => {
        it('sets state.diffType to SIDE_BY_SIDE_RENDERED', () => {
          const oldMediaType = 'image/jpeg';
          const newMediaType = 'text/html';

          const changeView = shallow(
            <ChangeView
              page={simplePage}
              from={{content_type: oldMediaType}}
              to={{content_type: oldMediaType}}
              user={{email: 'me'}}
            />,
            {context: {api: mockApi}}
          );

          changeView.setProps({
            from: {content_type: newMediaType},
            to: {content_type: newMediaType},
          });

          expect(changeView.state().diffType).toBe(defaultDiffType);
        });
      });

      describe('when defaultDiffType (SIDE_BY_SIDE_RENDERED) is NOT relevant to the pages being compared', () => {
        it('sets state.diffType to the first relevant diff type', () => {
          const oldMediaType = 'text/html';
          const newMediaType = 'image/jpeg';

          const changeView = shallow(
            <ChangeView
              page={simplePage}
              from={{content_type: oldMediaType}}
              to={{content_type: oldMediaType}}
              user={{email: 'me'}}
            />,
            {context: {api: mockApi}}
          );

          changeView.setProps({
            from: {content_type: newMediaType},
            to: {content_type: newMediaType},
          });

          expect(changeView.state().diffType).toBe(diffTypesFor(newMediaType)[0].value);
        });
      });
    });
  });

  describe('when the user chooses a new diffType', () => {
    it('sets state.diffType to the new diffType',  () => {
      const changeView = shallow(
        <ChangeView
          page={simplePage}
          from={{content_type: 'text/html'}}
          to={{content_type: 'text/html'}}
          user={{email: 'me'}}
        />,
        {context: {api: mockApi}}
      );

      expect(changeView.state().diffType).toBe(defaultDiffType);

      const newType = diffTypesFor('text/html')[0].value;

      // sanity check
      expect(newType).not.toEqual(defaultDiffType);

      changeView.find('SelectDiffType').props().onChange(newType);

      expect(changeView.state().diffType).toBe(newType);
    });
  });

  it('stores the new diffType in layeredStorage',  () => {
    const changeView = shallow(
      <ChangeView
        page={simplePage}
        from={{content_type: 'text/html'}}
        to={{content_type: 'text/html'}}
        user={{email: 'me'}}
      />,
      {context: {api: mockApi}}
    );

    const newType = diffTypesFor('text/html')[0].value;
    changeView.find('SelectDiffType').props().onChange(newType);

    expect(layeredStorage.getItem(diffTypeStorage)).toBe(newType);
  });
});
