import { useNavigate } from 'react-router';
import Loading from '../loading';
import SearchBar from '../search-bar/search-bar';
import StandardTooltip from '../standard-tooltip/standard-tooltip';
import PageTag from '../page-tag/page-tag';
import {
  getHttpStatusCategory,
  describeHttpStatus
} from '../../scripts/http-info';
import { removeNonUserTags } from '../../scripts/tools';

import baseStyles from '../../css/base.css';
import listStyles from './page-list.css';

/**
 * @typedef {Object} PageListProps
 * @property {Page[]} pages
 * @property {(any) => void} onSearch
 */

/**
 * Display a list of pages.
 *
 * @param {PageListProps} props
 */
export default function PageList ({ pages, onSearch }) {
  let results;

  if (!pages) {
    results = <Loading />;
  }
  else if (pages instanceof Error) {
    results = renderError(`Could not load pages: ${pages.message}`);
  }
  else if (pages.length === 0) {
    results = renderError('There were no page results.', 'warning');
  }
  else {
    results = (
      <div className={listStyles.container}>
        <StandardTooltip id="list-tooltip" />
        <table className={[listStyles.table, listStyles.pageList].join(' ')}>
          <thead>
            <tr>
              <th data-name="domain">Domain</th>
              <th data-name="page-name">Page Name</th>
              <th data-name="url">URL</th>
              <th data-name="tags">Tags</th>
              <th data-name="status">HTTP Status</th>
              <th data-name="active">Active?</th>
            </tr>
          </thead>
          <tbody>
            {pages.map(page => (
              <PageListRow page={page} key={page.uuid} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className={baseStyles.main}>
      <SearchBar
        onSearch={onSearch}
      />
      {results}
    </div>
  );
}

// TODO: we use similar markup elsewhere, consider making this a component
function renderError (message, type = 'danger') {
  return (
    <div className={listStyles.container}>
      <p className={[listStyles.listAlert, baseStyles.alert, baseStyles[`alert-${type}`]].join(' ')} role="alert">
        {message}
      </p>
    </div>
  );
}

/**
 * React component that renders a single row in the PageList table.
 */
function PageListRow ({ page }) {
  const navigate = useNavigate();
  const detailsUrl = `/page/${page.uuid}`;
  const tags = removeNonUserTags(page.tags);
  const statusCode = page.status || 200;
  const statusCategory = getHttpStatusCategory(statusCode);

  const onClick = (event) => {
    if (isInAnchor(event.target)) {
      return;
    }

    if (event.ctrlKey || event.metaKey) {
      window.open(detailsUrl, '_blank');
      return;
    }

    navigate(detailsUrl);
  };

  return (
    <tr onClick={onClick} data-name="info-row">
      <td>{getDomain(page.url)}</td>
      <td>{page.title}</td>
      <td><a href={page.url} target="_blank" rel="noreferrer">{page.url}</a></td>
      <td>{tags.map(tag => <PageTag tag={tag} key={tag.name} />)}</td>
      <td
        data-status-category={statusCategory}
        data-tooltip-id="list-tooltip"
        data-tooltip-content={describeHttpStatus(statusCode)}
      >
        {statusCode >= 400 ? '✘' : '•'} {page.status}
      </td>
      <td data-page-active={page.active.toString()}>
        {page.active ? '•' : '✘'}
      </td>
    </tr>
  );
}

function isInAnchor (node) {
  if (!node) {
    return false;
  }
  else if (node.nodeType === 1 && node.nodeName === 'A') {
    return true;
  }
  return isInAnchor(node.parentNode);
}

const HOST_WITHOUT_WWW_PATTERN = /^[^:]+:\/\/(?:ww+\d*\.)?([^/]+)/;

function getDomain (url) {
  return url.match(HOST_WITHOUT_WWW_PATTERN)[1];
}
