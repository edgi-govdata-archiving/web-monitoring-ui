/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import SideBySideFilePreview from '../../side-by-side-file-preview/side-by-side-file-preview';

// Mock the FilePreview component since we test it separately
jest.mock('../../file-preview/file-preview', () => {
  return function MockFilePreview ({ version }) {
    return <div data-testid="file-preview">{version.uuid}</div>;
  };
});

describe('SideBySideFilePreview', () => {
  const mockVersionA = {
    uuid: '1257a5f5-143b-40cd-86ec-4dfceaf361f1',
    media_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    url: 'https://test.com/test_a.xlsx',
    body_hash: '21807b63cb',
  };

  const mockVersionB = {
    uuid: '2c598723-2222-412e-9f55-bf229fb6ca6c',
    media_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    url: 'https://test.com/test_b.xlsx',
    body_hash: '21807b63fccb',
  };

  it('renders both versions side by side', () => {
    const { getByText, getAllByTestId } = render(
      <SideBySideFilePreview
        a={mockVersionA}
        b={mockVersionB}
      />
    );

    expect(getByText('From Version')).toBeInTheDocument();
    expect(getByText('To Version')).toBeInTheDocument();

    const filePreviews = getAllByTestId('file-preview');
    expect(filePreviews).toHaveLength(2);
  });
});
