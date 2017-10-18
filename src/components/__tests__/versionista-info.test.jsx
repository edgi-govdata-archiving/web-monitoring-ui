/* eslint-env jest */

import React from 'react';
import {render} from 'enzyme';
import VersionistaInfo from '../versionista-info';

describe('Versionista-Info', () => {
  const from = {
    'capture_time': new Date('2017-01-18T03:17:31.000Z'),
    'source_metadata': {
      'url': 'https://versionista.com/74273/6210778/9452489/',
      'account': 'versionista2',
      'page_id': '6210778',
      'site_id': '74273',
      'version_id': '9452489',
    }
  };

  const to = {
    'capture_time': new Date('2017-10-08T05:58:12.000Z'),
    'source_metadata': {
      'url': 'https://versionista.com/74273/6210778/13117888/',
      'account': 'versionista2',
      'page_id': '6210778',
      'site_id': '74273',
      'version_id': '13117888'
    }
  };

  const filler = {
    'capture_time': '0000',
    'source_metadata': {
      'url': '',
      'account': 'versionista2',
      'page_id': '0000',
      'site_id': '0000',
      'version_id': '0000'
    }
  };

  it('Gives us a message if there is only one version', () => {
    const vInfo = render(<VersionistaInfo />);
    expect(vInfo.text()).toBe('There is only one version. No diff to display.');
  });

  describe('Link tests', () => {
    it('Gives us a link', () => {
      const versions = [];
      versions.push(to);
      versions.push(from);

      const vInfo = render(<VersionistaInfo to={to} from={from} versions={versions} />);
      const { attribs: { href } } = vInfo.find('a')[0];
      expect(href).toBe('https://versionista.com/74273/6210778/13117888:9452489');
    });

    it('Gives us a link if `from` is first version', () => {
      const versions = [];
      versions.push(to);
      for (let i = 0; i < 50; i++) {
        versions.push(filler);
      }
      versions.push(from);

      const vInfo = render(<VersionistaInfo to={to} from={from} versions={versions} />);
      const { attribs: { href } } = vInfo.find('a')[0];
      expect(href).toBe('https://versionista.com/74273/6210778/13117888:9452489');
    });

    it('Switches `to` and `from` to give us correct Versionista link', () => {
      const versions = [];
      versions.push(to);
      versions.push(from);

      const vInfo = render(<VersionistaInfo to={from} from={to} versions={versions} />);
      const { attribs: { href } } = vInfo.find('a')[0];
      expect(href).toBe('https://versionista.com/74273/6210778/13117888:9452489');
    });
  });

  describe('Message tests', () => {
    const dateFormatter = new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      month: 'long',
      second: 'numeric',
      year: 'numeric',
      timeZone: 'UTC'
    });

    it('Tells us `from` is too old', () => {
      const versions = [];
      versions.push(to);
      for (let i = 0; i < 50; i++) {
        versions.push(filler);
      }
      versions.push(from);
      versions.push(filler);

      const vInfo = render(<VersionistaInfo to={to} from={from} versions={versions} />);

      //localize date
      const fromUTC = 'January 18, 2017, 3:17:31 AM';
      const fromDate = vInfo.text().match(/from (.*) is/)[1];
      const fromLocalized = dateFormatter.format(new Date(fromDate));
      expect(fromLocalized).toBe(fromUTC);
    });

    it('Tells us `to` is too old', () => {
      const versions = [];
      for (let i = 0; i < 50; i++) {
        versions.push(filler);
      }
      versions.push(to);
      versions.push(from);

      const vInfo = render(<VersionistaInfo to={to} from={from} versions={versions} />);

      //localize date
      const toUTC = 'October 8, 2017, 5:58:12 AM';
      const toDate = vInfo.text().match(/from (.*) is/)[1];
      const toLocalized = dateFormatter.format(new Date(toDate));
      expect(toLocalized).toBe(toUTC);
    });

    it('Tells us both are too old', () => {
      const versions = [];
      for (let i = 0; i < 50; i++) {
        versions.push(filler);
      }
      versions.push(to);
      versions.push(from);
      versions.push(filler);

      const vInfo = render(<VersionistaInfo to={to} from={from} versions={versions} />);

      var regex = /from ([^.]*) is/g;
      var matches, output = [];
      while (matches = regex.exec(vInfo.text())) {
          output.push(matches[1]);
      }

      const fromUTC = 'January 18, 2017, 3:17:31 AM';
      const fromDate = output[0];
      const fromLocalized = dateFormatter.format(new Date(fromDate));
      expect(fromLocalized).toBe(fromUTC);

      const toUTC = 'October 8, 2017, 5:58:12 AM';
      const toDate = output[1];
      const toLocalized = dateFormatter.format(new Date(toDate));
      expect(toLocalized).toBe(toUTC);
    });
  });
});
