/* eslint-env jest */
import PageUrlDetails from '../page-url-details/page-url-details';
import React from 'react';
import { mount } from 'enzyme';
import simplePage from '../../__mocks__/simple-page.json';

describe('PageUrlDetails Component', () => {
  // Change string values to date objects so they're parsed correctly
  simplePage.versions.forEach(version => {
    version.capture_time = new Date(version.capture_time);
  });

  it('shows nothing if version URLs and redirects match the page URL', () => {
    const view = mount(
      <PageUrlDetails
        page={simplePage}
        from={simplePage.versions[1]}
        to={simplePage.versions[0]}
      />
    );

    expect(view.children()).toHaveLength(0);
  });

  it("shows the versions' URL if it differs from the page's", () => {
    const version1 = {
      ...simplePage.versions[1],
      url: `${simplePage.url}/something`
    };
    const version2 = {
      ...simplePage.versions[0],
      url: `${simplePage.url}/something`
    };
    const view = mount(
      <PageUrlDetails
        page={simplePage}
        from={version1}
        to={version2}
      />
    );

    expect(view.debug()).toMatchSnapshot();
  });

  it("shows the versions' redirects", () => {
    const version1 = {
      ...simplePage.versions[1],
      source_metadata: {
        ...simplePage.versions[1].source_metadata,
        redirects: [
          simplePage.url,
          `${simplePage.url}/something`
        ]
      }
    };
    const version2 = {
      ...simplePage.versions[0],
      source_metadata: {
        ...simplePage.versions[0].source_metadata,
        redirects: [
          simplePage.url,
          `${simplePage.url}/something`
        ]
      }
    };
    const view = mount(
      <PageUrlDetails
        page={simplePage}
        from={version1}
        to={version2}
      />
    );

    expect(view.debug()).toMatchSnapshot();
  });

  it('shows separate URL histories for each version if they differ', () => {
    const version1 = {
      ...simplePage.versions[1],
      source_metadata: {
        ...simplePage.versions[1].source_metadata,
        redirects: [
          simplePage.url,
          `${simplePage.url}/something`
        ]
      }
    };
    const version2 = {
      ...simplePage.versions[0],
      source_metadata: {
        ...simplePage.versions[0].source_metadata,
        redirects: [
          simplePage.url,
          `${simplePage.url}/something/else`
        ]
      }
    };
    const view = mount(
      <PageUrlDetails
        page={simplePage}
        from={version1}
        to={version2}
      />
    );

    expect(view.debug()).toMatchSnapshot();
  });
});
