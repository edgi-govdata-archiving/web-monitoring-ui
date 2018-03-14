/* eslint-env jest */

import WebMonitoringApi from '../web-monitoring-api';
import fetch from 'fetch-mock';

describe('WebMonitoringApi', () => {
  let api;

  beforeEach(() => {
    api = new WebMonitoringApi({
      getPages: jest.fn(query => Promise.resolve([
        {url: 'a', tags: [{name: 'site:first'}]},
        {url: 'b', tags: [{name: 'site:second'}]},
        {url: 'c', tags: [{name: 'site:second'}]}
      ].filter(page => {
        if (query['tags[]']) {
          return page.tags[0].name === query['tags[]'];
        }
        return true;
      })))
    });
  });

  afterEach(() => {
    fetch.restore();
  });

  test('getCurrentTimeframe() returns parsed data', () => {
    fetch.mock('begin:/api/timeframe', {
      duration: 259200,
      end: '2017-01-04',
      start: '2017-01-01'
    });
    return expect(api.getCurrentTimeframe()).resolves.toEqual({
      duration: 259200,
      end: new Date('2017-01-04'),
      start: new Date('2017-01-01')
    });
  });

  test('getDomainsForUser() returns parsed data', () => {
    fetch.mock('begin:/api/domains/', {domains: ['first', 'second']});
    return expect(api.getDomainsForUser('x'))
      .resolves
      .toEqual(['first', 'second']);
  });

  test('getDomainsForUser() rejects for users without assignments', () => {
    fetch.mock('begin:/api/domains/', {error: 'NOT_FOUND'});
    return expect(api.getDomainsForUser('x')).rejects.toBeTruthy();
  });

  test('getDomainsForUser() rejects for bad input', () => {
    return expect(api.getDomainsForUser()).rejects.toBeTruthy();
  });

  test('getPagesForUser() calls through to WebMonitoringDb', () => {
    fetch
      .mock('begin:/api/timeframe', {
        duration: 259200,
        end: '2017-01-04',
        start: '2017-01-01'
      })
      .mock('begin:/api/domains/', {domains: ['first', 'second']});

    expect(api.getPagesForUser('x')).resolves.toEqual([
      {url: 'a', tags: [{name: 'site:first'}]},
      {url: 'b', tags: [{name: 'site:second'}]},
      {url: 'c', tags: [{name: 'site:second'}]}
    ]);
  });

  test.skip('getPagesForUser() does not have duplicate entries', () => {
    fetch
      .mock('begin:/api/timeframe', {
        duration: 259200,
        end: '2017-01-04',
        start: '2017-01-01'
      })
      .mock('begin:/api/domains/', {domains: ['first', 'first']});

    expect(api.getPagesForUser('x')).resolves.toEqual([
      {url: 'a', site: 'first'}
    ]);
  });

});
