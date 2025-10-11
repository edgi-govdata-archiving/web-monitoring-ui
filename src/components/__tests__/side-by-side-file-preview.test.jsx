/* eslint-env jest */

/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import SideBySideFilePreview from '../side-by-side-file-preview';

// Mock the FilePreview component since we test it separately
jest.mock('../file-preview', () => {
  return function MockFilePreview ({ page, version, content }) {
    return <div data-testid="file-preview">{version.uuid}</div>;
  };
});

describe('SideBySideFilePreview', () => {
  const mockPage = {
    url: 'https://example.com/test.xlsx',
    uuid: 'mock-page-uuid'
  };

  const mockVersionA = {
    uuid: 'version-a-uuid',
    media_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    body_url: 'https://example.com/versions/test-a.xlsx',
  };

  const mockVersionB = {
    uuid: 'version-b-uuid',
    media_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    body_url: 'https://example.com/versions/test-b.xlsx',
  };

  const mockDiffData = {
    rawA: 'raw content A',
    rawB: 'raw content B'
  };

  it('renders both versions side by side', () => {
    const { getByText, getAllByTestId } = render(
      <SideBySideFilePreview
        page={mockPage}
        a={mockVersionA}
        b={mockVersionB}
        diffData={mockDiffData}
      />
    );

    expect(getByText('From Version')).toBeInTheDocument();
    expect(getByText('To Version')).toBeInTheDocument();

    const filePreviews = getAllByTestId('file-preview');
    expect(filePreviews).toHaveLength(2);
    expect(filePreviews[0]).toHaveTextContent('version-a-uuid');
    expect(filePreviews[1]).toHaveTextContent('version-b-uuid');
  });
});
