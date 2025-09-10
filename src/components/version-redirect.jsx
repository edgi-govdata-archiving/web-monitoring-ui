import Loading from './loading';
import { use, useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router';
import { ApiContext } from './api-context';

import styles from '../css/base.css';

export default function VersionRedirect () {
  const api = use(ApiContext);
  const { versionId } = useParams();
  const [pageId, setPageId] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    let usable = true;
    api.api.getVersion(versionId)
      .then(data => {
        if (usable) {
          setPageId(data.page_uuid);
        }
      })
      .catch(error => setError(error));

    return () => {
      usable = false;
    };
  }, [api, versionId]);

  if (error) {
    return (
      <p className={[styles.alert, styles.alertDanger].join(' ')} role="alert">
        Error: We couldn't find the version you're looking for.
        Please check you provided the correct versionID.
      </p>
    );
  }

  if (!pageId) {
    return <Loading />;
  }

  return <Navigate to={`/page/${pageId}/..${versionId}`} replace />;
}
