/* eslint-env jest */

/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import FilePreview from '../file-preview';

describe('FilePreview', () => {
  const mockPage = {
    url: 'https://example.com/test.xlsx',
    uuid: 'mock-page-uuid'
  };

  const mockVersion = {
    uuid: 'mock-version-uuid',
    media_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    body_url: 'https://example.com/versions/test.xlsx',
    body_hash: 'abc123def456',
    capture_time: '2023-01-01T12:00:00Z'
  };

  it('renders file information correctly', () => {
    const { getByText } = render(
      <FilePreview page={mockPage} version={mockVersion} />
    );

    expect(getByText('File Information')).toBeInTheDocument();
    expect(getByText('test.xlsx')).toBeInTheDocument();
    expect(getByText('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')).toBeInTheDocument();
    expect(getByText('abc123def456')).toBeInTheDocument();
  });

  it('renders download and view buttons', () => {
    const { getByText } = render(
      <FilePreview page={mockPage} version={mockVersion} />
    );
    const viewButton = getByText('View Raw File');

    expect(viewButton).toBeInTheDocument();
    expect(viewButton.getAttribute('href')).toBe('https://example.com/versions/test.xlsx');
  });

  it('shows non-renderable content warning', () => {
    const { getByText } = render(
      <FilePreview page={mockPage} version={mockVersion} />
    );

    expect(getByText(/This file type cannot be rendered inline/)).toBeInTheDocument();
  });

  it('handles missing filename gracefully', () => {
    const versionWithoutFilename = {
      ...mockVersion,
      body_url: 'https://example.com/versions/'
    };
    const pageWithoutFilename = {
      ...mockPage,
      url: 'https://example.com/'
    };

    const { getByText, queryByText } = render(
      <FilePreview page={pageWithoutFilename} version={versionWithoutFilename} />
    );

    // Check that no filename is rendered if there is no URL
    expect(queryByText('test.xlsx')).not.toBeInTheDocument();
    // Check for fallback behavior
    expect(getByText('File Information')).toBeInTheDocument();
  });
});
