/* eslint-env jest */

import React from 'react';
import {render} from 'enzyme';
import VersionistaInfo from '../versionista-info';

describe('Versionista-Info', () => {
  const from = {
    'uuid': 'a',
    'capture_time': new Date('2017-01-18T03:17:31.000Z'),
    'source_type': 'versionista',
    'source_metadata': {
      'url': 'https://versionista.com/74273/6210778/9452489/',
      'account': 'versionista2',
      'page_id': '6210778',
      'site_id': '74273',
      'version_id': '9452489',
    }
  };

  const to = {
    'uuid': 'b',
    'capture_time': new Date('2017-10-08T05:58:12.000Z'),
    'source_type': 'versionista',
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
    'source_type': 'versionista',
    'source_metadata': {
      'url': '',
      'account': 'versionista2',
      'page_id': '0000',
      'site_id': '0000',
      'version_id': '0000'
    }
  };

  it('outputs nothing if no versions are specified', () => {
    const vInfo = render(<VersionistaInfo />);
    expect(vInfo.text()).toBe('');
  });

  it('outputs nothing if either version is not from versionista', () => {
    const otherFrom = Object.assign({}, from, {source_type: 'elsewhere'});
    const otherTo = Object.assign({}, to, {source_type: 'elsewhere'});
    const vInfo = render(<VersionistaInfo from={otherFrom} to={otherTo} />);
    expect(vInfo.text()).toBe('');
  });

  it('outputs link to page view if both versions are the same', () => {
    const vInfo = render(<VersionistaInfo from={from} to={from} />);
    const { attribs: { href } } = vInfo.find('a')[0];
    expect(href).toBe('https://versionista.com/74273/6210778/');
  });

  describe('Link tests', () => {
    it('outputs correct link in normal situation', () => {
      const versions = [];
      versions.push(to, from);

      const vInfo = render(<VersionistaInfo to={to} from={from} versions={versions} />);
      const { attribs: { href } } = vInfo.find('a')[0];
      expect(href).toBe('https://versionista.com/74273/6210778/13117888:9452489/');
    });

    it('outputs link if `from` is first version of set of >50 versions', () => {
      const versions = [];
      versions.push(to);
      for (let i = 0; i < 50; i++) {
        versions.push(filler);
      }
      versions.push(from);

      const vInfo = render(<VersionistaInfo to={to} from={from} versions={versions} />);
      const { attribs: { href } } = vInfo.find('a')[0];
      expect(href).toBe('https://versionista.com/74273/6210778/13117888:9452489/');
    });

    it('switches `to` and `from` to give us correct Versionista link', () => {
      const versions = [];
      versions.push(to, from);

      const vInfo = render(<VersionistaInfo to={from} from={to} versions={versions} />);
      const { attribs: { href } } = vInfo.find('a')[0];
      expect(href).toBe('https://versionista.com/74273/6210778/13117888:9452489/');
    });
  });

  describe('Message tests', () => {
    it('outputs `from` is too old', () => {
      const versions = [];
      versions.push(to);
      for (let i = 0; i < 50; i++) {
        versions.push(filler);
      }
      versions.push(from, filler);

      const vInfo = render(<VersionistaInfo to={to} from={from} versions={versions} />);
      const fromDate = new Date(vInfo.text().match(/from (.*) is/)[1]);
      expect(fromDate).toEqual(from.capture_time);
    });

    it('outputs `to` is too old', () => {
      const versions = [];
      for (let i = 0; i < 50; i++) {
        versions.push(filler);
      }
      versions.push(to, from);

      const vInfo = render(<VersionistaInfo to={to} from={from} versions={versions} />);
      const toDate = new Date(vInfo.text().match(/from (.*) is/)[1]);
      expect(toDate).toEqual(to.capture_time);
    });

    it('outputs both are too old', () => {
      const versions = [];
      for (let i = 0; i < 50; i++) {
        versions.push(filler);
      }
      versions.push(to, from, filler);

      const vInfo = render(<VersionistaInfo to={to} from={from} versions={versions} />);
      expect(vInfo.text()).toBe('Both versions are no longer in Versionista. ');
    });
  });
});
