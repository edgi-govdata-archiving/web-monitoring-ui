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
    it('Tells us `from` is too old', () => {
      const versions = [];
      versions.push(to);
      for (let i = 0; i < 50; i++) {
        versions.push(filler);
      }
      versions.push(from);
      versions.push(filler);

      const vInfo = render(<VersionistaInfo to={to} from={from} versions={versions} />);
      expect(vInfo.text()).toBe('Version from January 17, 2017, 7:17:31 PM is no longer in Versionista. ');
    });

    it('Tells us `to` is too old', () => {
      const versions = [];
      for (let i = 0; i < 50; i++) {
        versions.push(filler);
      }
      versions.push(to);
      versions.push(from);

      const vInfo = render(<VersionistaInfo to={to} from={from} versions={versions} />);
      expect(vInfo.text()).toBe('Version from October 7, 2017, 10:58:12 PM is no longer in Versionista. ');
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
      expect(vInfo.text()).toBe('Version from January 17, 2017, 7:17:31 PM is no longer in Versionista. Version from October 7, 2017, 10:58:12 PM is no longer in Versionista. ');
    });
  });
});
