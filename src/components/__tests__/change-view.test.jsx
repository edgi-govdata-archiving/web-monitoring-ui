/* eslint-env jest */

import { render, screen, fireEvent, act } from '@testing-library/react';
import { ApiContext } from '../api-context';
import ChangeView, { defaultDiffType, diffTypeStorage } from '../change-view/change-view';
import layeredStorage from '../../scripts/layered-storage';
import simplePage from '../../__mocks__/simple-page.json';
import WebMonitoringDb from '../../services/web-monitoring-db';
import { diffTypesFor } from '../../constants/diff-types';

// The mock simply renders a list of props so we can inspect them.
jest.mock('../diff-view');

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

// Change string values to date objects so they're parsed correctly
simplePage.versions.forEach(version => {
  version.capture_time = new Date(version.capture_time);
});

const mockChange = {
  uuid: '70aa8b7b-d485-48dc-8295-7635ff04dc5b..ed4aed23-424e-4326-ac75-c3ad72797bad',
  uuid_from: '70aa8b7b-d485-48dc-8295-7635ff04dc5b',
  uuid_to: 'ed4aed23-424e-4326-ac75-c3ad72797bad',
  priority: null,
  current_annotation: {},
  created_at: null,
  updated_at: null,
  significance: null
};

const mockChangeFrom = simplePage.versions.find(v => v.uuid === mockChange.uuid_from);
const mockChangeTo = simplePage.versions.find(v => v.uuid === mockChange.uuid_to);

// Note for testing relevant diffTypes:
// the defaultDiffType (SIDE_BY_SIDE_RENDERED) is only relevant for the "text/html" media type
// the relevant types for "text/*" are a subset of the relevant types for "text/html"
// the relevant types for 'text/html' and "*/*" are mutually exclusive

describe('change-view', () => {
  const mockApi = Object.assign(
    Object.create(WebMonitoringDb.prototype),
    { getChange: () => Promise.resolve(mockChange) }
  );

  function createChangeView ({ mediaType = null, fromMediaType = null, toMediaType = null } = {}) {
    if (mediaType) {
      fromMediaType = toMediaType = mediaType;
    }
    else {
      fromMediaType = fromMediaType || 'text/html';
      toMediaType = toMediaType || 'text/html';
    }

    return (
      <ApiContext value={{ api: mockApi }}>
        <ChangeView
          page={simplePage}
          from={{ ...mockChangeFrom, media_type: fromMediaType }}
          to={{ ...mockChangeTo, media_type: toMediaType }}
          user={{ email: 'me' }}
        />
      </ApiContext>
    );
  }

  function renderBasicChangeView (options) {
    const result = render(createChangeView(options));
    const rerender = result.rerender;
    result.rerender = (newOptions) => rerender(createChangeView(newOptions));
    return result;
  }

  afterEach(() => {
    layeredStorage.clear();
  });

  describe('initial diffType', () => {
    describe('when a diffType has been stored in layeredStorage and is relevant to the pages being compared', () => {
      it('sets state.diffType to the stored value', async () => {
        const storedDiffType = 'CHANGES_ONLY_TEXT';
        layeredStorage.setItem(diffTypeStorage, storedDiffType);

        renderBasicChangeView({ mediaType: 'text/html' });

        await screen.findByText(`diffType="${storedDiffType}"`);
      });

      describe('when a diffType has been stored in layeredStorage and is is NOT relevant to the pages being compared', () => {
        it('sets state.diffType to defaultDiffType if that is relevant to the pages being compared', () => {
          const storedDiffType = 'IRRELEVANT_DIFF_TYPE';
          layeredStorage.setItem(diffTypeStorage, storedDiffType);

          renderBasicChangeView({ mediaType: 'text/html' });

          screen.getByText(`diffType="${defaultDiffType}"`);
        });

        it('sets state.diffType to the first relevant diff type if defaultDiffType is NOT relevant to the pages being compared', () => {
          const storedDiffType = 'IRRELEVANT_DIFF_TYPE';
          layeredStorage.setItem(diffTypeStorage, storedDiffType);

          const mediaType = 'text/xml';
          const relevantTypes = diffTypesFor(mediaType);

          renderBasicChangeView({ mediaType });

          screen.getByText(`diffType="${relevantTypes[0].value}"`);
        });
      });
    });

    describe('when a diffType has NOT been stored in layeredStorage', () => {
      it('sets state.diffType to defaultDiffType if that is relevant to the pages being compared', () => {
        renderBasicChangeView();
        screen.getByText(`diffType="${defaultDiffType}"`);
      });

      it('sets state.diffType to the first relevant diff type if defautDiffType is NOT relevant to the pages being compared', () => {
        const mediaType = 'text/xml';
        const relevantTypes = diffTypesFor(mediaType);

        renderBasicChangeView({ mediaType });

        screen.getByText(`diffType="${relevantTypes[0].value}"`);
      });
    });
  });

  describe('when the page versions change via props', () => {
    it('leaves state.diffType at its current value when it is relevant to the new pages being compared', () => {
      const oldMediaType = 'text/xml';
      const newMediaType = 'text/html';

      const diffType = diffTypesFor(oldMediaType)[0].value;

      const { rerender } = renderBasicChangeView({ mediaType: oldMediaType });
      rerender({ mediaType: newMediaType });

      screen.getByText(`diffType="${diffType}"`);
    });

    describe('when state.diffType is NOT relevant to the new pages being compared', () => {
      describe('when a diffType has been stored in layeredStorage', () => {
        it('sets state.diffType to the stored value in layeredStorage if that diffType is relevant to the pages being compared', () => {
          const oldMediaType = 'text/html';
          const newMediaType = 'image/jpeg';

          const storedDiffType = diffTypesFor(newMediaType)[1].value;
          layeredStorage.setItem(diffTypeStorage, storedDiffType);

          const { rerender } = renderBasicChangeView({ mediaType: oldMediaType });
          rerender({ mediaType: newMediaType });

          screen.getByText(`diffType="${storedDiffType}"`);
        });

        it('sets state.diffType to defaultDiffType if the stored diffType is NOT relevant to the pages being compared but defaultDiffType is', () => {
          const oldMediaType = 'image/jpeg';
          const newMediaType = 'text/html';

          const storedDiffType = 'IRRELEVANT_DIFF_TYPE';
          layeredStorage.setItem(diffTypeStorage, storedDiffType);

          const { rerender } = renderBasicChangeView({ mediaType: oldMediaType });
          rerender({ mediaType: newMediaType });

          screen.getByText(`diffType="${defaultDiffType}"`);
        });

        it('sets state.diffType to the first relevant diff type if neither the stored diffType nor defaultDiffType are relevant to the pages being compared', () => {
          const oldMediaType = 'text/html';
          const newMediaType = 'image/jpeg';

          const storedDiffType = 'IRRELEVANT_DIFF_TYPE';
          layeredStorage.setItem(diffTypeStorage, storedDiffType);

          const { rerender } = renderBasicChangeView({ mediaType: oldMediaType });
          rerender({ mediaType: newMediaType });

          screen.getByText(`diffType="${diffTypesFor(newMediaType)[0].value}"`);
        });
      });
    });

    it('sets state.diffType to defaultDiffType if it is relevant to the pages being compared', () => {
      const oldMediaType = 'image/jpeg';
      const newMediaType = 'text/html';

      const { rerender } = renderBasicChangeView({ mediaType: oldMediaType });
      rerender({ mediaType: newMediaType });

      screen.getByText(`diffType="${defaultDiffType}"`);
    });

    it('sets state.diffType to the first relevant diff type if defaultDiffType is NOT relevant to the pages being compared', () => {
      const oldMediaType = 'text/html';
      const newMediaType = 'image/jpeg';

      const { rerender } = renderBasicChangeView({ mediaType: oldMediaType });
      rerender({ mediaType: newMediaType });

      screen.getByText(`diffType="${diffTypesFor(newMediaType)[0].value}"`);
    });
  });

  describe('when the user chooses a new diffType', () => {
    it('sets state.diffType to the new diffType',  async () => {
      renderBasicChangeView({ mediaType: 'text/html' });
      screen.getByText(`diffType="${defaultDiffType}"`);

      const newType = diffTypesFor('text/html')[0].value;
      // sanity check
      expect(newType).not.toEqual(defaultDiffType);

      await act(() => {
        const diffSelector = screen.getByLabelText('Comparison:');
        diffSelector.value = newType;
        fireEvent.change(diffSelector);
      });

      screen.getByText(`diffType="${newType}"`);
    });

    it('stores the new diffType in layeredStorage',  async () => {
      renderBasicChangeView({ mediaType: 'text/html' });

      const newType = diffTypesFor('text/html')[0].value;
      await act(() => {
        const diffSelector = screen.getByLabelText('Comparison:');
        diffSelector.value = newType;
        fireEvent.change(diffSelector);
      });

      expect(layeredStorage.getItem(diffTypeStorage)).toBe(newType);
    });
  });
});
