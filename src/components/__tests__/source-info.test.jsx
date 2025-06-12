/* eslint-env jest */

import { render, screen } from '@testing-library/react';
import SourceInfo from '../source-info/source-info';

describe('source-info', () => {
  const noViewUrl = {
    source_type: 'versionista',
    source_metadata: {
      url: 'https://versionista.com/1111/2222/3333/',
      account: 'versionista1',
      page_id: '1234567',
      site_id: '8888888',
      version_id: '123456778',
      has_content: true
    }
  };

  const withViewUrl1 = {
    source_type: 'internet_archive',
    source_metadata: {
      encoding: 'ISO-8859-1',
      view_url: 'http://web.archive.org/web/1111111/https://19january2017snapshot.epa.gov/test-url',
      mime_type: 'text/html',
      status_code: 200
    }
  };

  const withViewUrl2 = {
    source_type: 'internet_archive',
    source_metadata: {
      encoding: 'ISO-8859-1',
      view_url: 'http://web.archive.org/web/22222/https://19january2017snapshot.epa.gov/test-url',
      mime_type: 'text/html',
      status_code: 200
    }
  };

  const pageUrl = 'https://19january2017snapshot.epa.gov/test-url';

  it('Renders only the Wayback calendar link if neither of the page versions have a view_url', () => {
    render(<SourceInfo from={noViewUrl} to={noViewUrl} pageUrl={pageUrl} />);

    const link = screen.getByRole('link', { name: 'Wayback Machine calendar view' });
    expect(link).toHaveAttribute('href', 'https://web.archive.org/web/*/https://19january2017snapshot.epa.gov/test-url');

    const allLinks = screen.getAllByRole('link');
    expect(allLinks).toHaveLength(1);
  });

  it('Renders the Wayback calendar link and previous/next versions with Wayback links if they are sourced from Wayback', () => {
    render(<SourceInfo from={withViewUrl1} to={withViewUrl2} pageUrl={pageUrl} />);

    const allLinks = screen.getAllByRole('link');
    expect(allLinks).toHaveLength(3);

    const calendarLink = screen.getByRole('link', { name: 'Wayback Machine calendar view' });
    expect(calendarLink).toHaveAttribute('href', 'https://web.archive.org/web/*/https://19january2017snapshot.epa.gov/test-url');

    const aLink = screen.getByRole('link', { name: 'Wayback Machine previous page version' });
    expect(aLink).toHaveAttribute('href', 'http://web.archive.org/web/1111111/https://19january2017snapshot.epa.gov/test-url');

    const bLink = screen.getByRole('link', { name: 'Wayback Machine next page version' });
    expect(bLink).toHaveAttribute('href', 'http://web.archive.org/web/22222/https://19january2017snapshot.epa.gov/test-url');
  });
});
