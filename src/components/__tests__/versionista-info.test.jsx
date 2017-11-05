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

  it('Outputs nothing if no versions are specified', () => {
    const vInfo = render(<VersionistaInfo />);
    expect(vInfo.text()).toBe('');
  });

  it('Outputs nothing if either version is not from versionista', () => {
    const otherFrom = Object.assign({}, from, {source_type: 'elsewhere'});
    const otherTo = Object.assign({}, to, {source_type: 'elsewhere'});
    const vInfo = render(<VersionistaInfo from={otherFrom} to={otherTo} />);
    expect(vInfo.text()).toBe('');
  });

  it('Prints a message if only one version is specified', () => {
    const vInfo = render(<VersionistaInfo from={from} to={from} />);
    expect(vInfo.text()).toBe('No link to display because the selected versions are the same.');
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
      versions.push(from, filler);

      const vInfo = render(<VersionistaInfo to={to} from={from} versions={versions} />);

      const fromDate = new Date(vInfo.text().match(/from (.*) is/)[1]);
      expect(fromDate).toEqual(from.capture_time);
    });

    it('Tells us `to` is too old', () => {
      const versions = [];
      for (let i = 0; i < 50; i++) {
        versions.push(filler);
      }
      versions.push(to);
      versions.push(from);

      const vInfo = render(<VersionistaInfo to={to} from={from} versions={versions} />);

      const toDate = new Date(vInfo.text().match(/from (.*) is/)[1]);
      expect(toDate).toEqual(to.capture_time);
    });

    it('Tells us both are too old', () => {
      const versions = [];
      for (let i = 0; i < 50; i++) {
        versions.push(filler);
      }
      versions.push(to, from, filler);

      const vInfo = render(<VersionistaInfo to={to} from={from} versions={versions} />);

      const format = /from ([^.]+?) and ([^.]+?) are/;
      expect(vInfo.text()).toMatch(format);
      const matches = vInfo.text().match(format);

      // var matches, output = [];
      // while (matches = regex.exec(vInfo.text())) {
      //     output.push(matches[1]);
      // }

      // const fromUTC = 'January 18, 2017, 3:17:31 AM';
      const fromDate = new Date(matches[1]);
      // const fromLocalized = dateFormatter.format(new Date(fromDate));
      expect(fromDate).toEqual(from.capture_time);

      // const toUTC = 'October 8, 2017, 5:58:12 AM';
      const toDate = new Date(matches[2]);
      // const toLocalized = dateFormatter.format(new Date(toDate));
      expect(toDate).toEqual(to.capture_time);
    });
  });
});
