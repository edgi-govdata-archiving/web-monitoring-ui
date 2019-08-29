/* eslint-env jest */

import React from 'react';
import {shallow} from 'enzyme';
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
    const sInfo = shallow(<SourceInfo from={noViewUrl} to={noViewUrl} pageUrl={pageUrl} />);
    expect(sInfo.text()).toBe('Wayback Machine calendar view');
    const anchorTag = sInfo.find('a');
    expect(anchorTag.length).toBe(1);
    const { props: { href } } = anchorTag.get(0);
    expect(href).toBe('https://web.archive.org/web/*/https://19january2017snapshot.epa.gov/test-url');
  });

  it('Renders the Wayback calendar link and previous/next versions with Wayback links if they are sourced from Wayback', () => {
    const sInfo = shallow(<SourceInfo from={withViewUrl1} to={withViewUrl2} pageUrl={pageUrl} />);
    expect(sInfo.text()).toBe('Wayback Machine calendar view | Wayback Machine previous page version | Wayback Machine next page version');
    const anchorTags = sInfo.find('a');
    expect(anchorTags.length).toBe(3);
    const { props: { href : href1 } } = anchorTags.get(1);
    const { props: { href: href2 } } = anchorTags.get(2);
    expect(href1).toBe('http://web.archive.org/web/1111111/https://19january2017snapshot.epa.gov/test-url');
    expect(href2).toBe('http://web.archive.org/web/22222/https://19january2017snapshot.epa.gov/test-url');
  });
});
