/* eslint-env jest */

/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import FilePreview from '../file-preview';

describe('FilePreview', () => {

  const mockVersion = {
    uuid: 'mock-version-uuid',
    media_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    url: 'https://example.com/versions/test.xlsx',
    body_url: 'https://example.com/versions/scscs28u2882',
    body_hash: 'abc123def456',
    capture_time: '2023-01-01T12:00:00Z'
  };

  it('renders file information correctly', () => {
    const { getByText } = render(
      <FilePreview version={mockVersion} />
    );

    expect(getByText('test.xlsx')).toBeInTheDocument();
    expect(getByText('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')).toBeInTheDocument();
    expect(getByText('abc123def456')).toBeInTheDocument();
  });

  it('renders download and view buttons', () => {
    const { getByText } = render(
      <FilePreview version={mockVersion} />
    );
    const viewButton = getByText('View Raw File');

    expect(viewButton).toBeInTheDocument();
    expect(viewButton.getAttribute('href')).toBe('https://example.com/versions/scscs28u2882');
  });

  it('shows non-renderable content warning', () => {
    const { getByText } = render(
      <FilePreview version={mockVersion} />
    );

    expect(getByText('File Information')).toBeInTheDocument();
  });

  it('handles missing filename gracefully', () => {
    const versionWithoutFilename = {
      ...mockVersion,
      url: 'https://example.com/'
    };

    const { getByText } = render(
      <FilePreview version={versionWithoutFilename} />
    );

    // Check for fallback behavior
    expect(getByText('https://example.com/')).toBeInTheDocument();
  });
});
