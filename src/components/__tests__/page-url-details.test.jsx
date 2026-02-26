import { render } from '@testing-library/react';
import PageUrlDetails from '../page-url-details/page-url-details';
import simplePage from '../../__mocks__/simple-page.json';

describe('PageUrlDetails Component', () => {
  // Change string values to date objects so they're parsed correctly
  simplePage.versions.forEach(version => {
    version.capture_time = new Date(version.capture_time);
  });

  it('shows nothing if version URLs and redirects match the page URL', () => {
    const { container } = render(
      <PageUrlDetails
        page={simplePage}
        from={simplePage.versions[1]}
        to={simplePage.versions[0]}
      />
    );

    expect(container).toBeEmptyDOMElement();
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
    const { container } = render(
      <PageUrlDetails
        page={simplePage}
        from={version1}
        to={version2}
      />
    );

    expect(container).toMatchSnapshot();
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
    const { container } = render(
      <PageUrlDetails
        page={simplePage}
        from={version1}
        to={version2}
      />
    );

    expect(container).toMatchSnapshot();
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
    const { container } = render(
      <PageUrlDetails
        page={simplePage}
        from={version1}
        to={version2}
      />
    );

    expect(container).toMatchSnapshot();
  });

  it('handles malformed redirect data by filtering out invalid URLs', () => {
    const version1 = {
      ...simplePage.versions[1],
      source_metadata: {
        ...simplePage.versions[1].source_metadata,
        redirects: [
          '2016-01-01T00:00:00.000Z'
        ]
      }
    };
    const version2 = {
      ...simplePage.versions[0],
      source_metadata: {
        ...simplePage.versions[0].source_metadata,
        redirects: [
          '2016-01-01T00:00:00.000Z'
        ]
      }
    };
    const { container } = render(
      <PageUrlDetails
        page={simplePage}
        from={version1}
        to={version2}
      />
    );

    // Should render without error
    expect(container).toBeEmptyDOMElement();
  });

  it('filters out only invalid URLs from redirects, keeping valid ones', () => {
    const version1 = {
      ...simplePage.versions[1],
      source_metadata: {
        ...simplePage.versions[1].source_metadata,
        redirects: [
          simplePage.url,
          '2016-01-01T00:00:00.000Z',
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
          '2016-01-01T00:00:00.000Z',
          `${simplePage.url}/something`
        ]
      }
    };
    const { container } = render(
      <PageUrlDetails
        page={simplePage}
        from={version1}
        to={version2}
      />
    );

    // Should show the redirect list with valid URLs only (invalid timestamp filtered out)
    expect(container.querySelector('summary')).toHaveTextContent('Captured URL Redirected Somewhere Else');
    const listItems = container.querySelectorAll('.urlHistoryList li');
    expect(listItems).toHaveLength(2);
    // Should only have valid URLs, not the timestamp
    expect(listItems[0].querySelector('a')).toHaveAttribute('href', simplePage.url);
    expect(listItems[1].querySelector('a')).toHaveAttribute('href', `${simplePage.url}/something`);
  });
});
