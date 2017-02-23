import datetime
import collections
import uuid
import requests
import hashlib
import time
import csv
import sqlalchemy
import pymongo


def create(engine):
    # These schemas were informed by work by @Mr0grog at
    # https://github.com/edgi-govdata-archiving/webpage-versions-db/blob/master/db/schema.rb
    meta = sqlalchemy.MetaData(engine)

    columns = (
            sqlalchemy.Column('uuid', sqlalchemy.Text, primary_key=True),
            sqlalchemy.Column('url', sqlalchemy.Text),
            sqlalchemy.Column('title', sqlalchemy.Text),
            sqlalchemy.Column('agency', sqlalchemy.Text),
            sqlalchemy.Column('site', sqlalchemy.Text),
            sqlalchemy.Column('created_at', sqlalchemy.DateTime,
                            default=datetime.datetime.utcnow),
    )
    sqlalchemy.Table("Pages", meta, *columns)

    columns = (
            sqlalchemy.Column('uuid', sqlalchemy.Text, primary_key=True),
            sqlalchemy.Column('page_uuid', sqlalchemy.Text),
            sqlalchemy.Column('capture_time', sqlalchemy.DateTime),
            sqlalchemy.Column('path', sqlalchemy.Text),
            sqlalchemy.Column('created_at', sqlalchemy.DateTime,
                            default=datetime.datetime.utcnow),
    )
    sqlalchemy.Table("Snapshots", meta, *columns)

    meta.create_all()


class Pages:
    """
    Interface to a table associating a URL with agency metadata.
    """
    def __init__(self, meta):
        self._table = sqlalchemy.Table('Pages', meta)

    def insert(self, url, title='', agency='', site=''):
        c = self._conn
        _uuid = str(uuid.uuid4())
        c.execute("INSERT INTO Pages (uuid, url, title, agency, site) "
                  "VALUES "
                  "(?, ?, ?, ?, ?);", (_uuid, url, title, agency, site))
        return _uuid

    def __len__(self):
        c = self._conn
        length, = c.execute("SELECT COUNT(*) FROM Pages").fetchone()
        return length


class Snapshots:
    """
    Interface to a table associating an HTML snapshot at some time with a Page.

    Parameters
    ----------
    conn : sqlalchemy Connection
    """
    processing_deque = collections.deque()
    nt = collections.namedtuple('Snapshot', 'uuid page_uuid capture_time path')

    def __init__(self, conn):
        self._conn = conn

    def insert(self, page_uuid, capture_time, path):
        c = self._conn
        _uuid = str(uuid.uuid4())
        c.execute("INSERT INTO Snapshots "
                  "(uuid, page_uuid, capture_time, path) "
                  "VALUES "
                  "(?, ?, ?, ?);", (_uuid, page_uuid, capture_time, path))
        self.processing_deque.append(_uuid)
        return _uuid

    def __getitem__(self, uuid):
        "instance[uuid] -> namedtuple"
        c = self._conn
        result = c.execute("SELECT uuid, page_uuid, capture_time, path "
                           "FROM Snapshots "
                           "WHERE uuid=?;", uuid).fetchone()
        return self.nt(*result)

    def __len__(self):
        c = self._conn
        length, = c.execute("SELECT COUNT(*) FROM Snapshots").fetchone()
        return length


class Results:
    """
    Interface to an object store of PageFreezer(-like) results.

    Parameters
    ----------
    db : pymongo database
    """
    def __init__(self, db):
        self._collection = db['page_freezer_results_v1']

    def insert(self, url1, time1, url2, time2, result):
        diff = str(result['result']['diff'])
        diffhash = hashlib.sha256(diff).hexdigest()
        _uuid = str(uuid.uuid4())
        self._collection.insert_one({'uuid': _uuid,
                                     'diffhash': diffhash,
                                     'created_at': time.time(),
                                     'url1': url1,
                                     'url2': url2,
                                     'time1': time1,
                                     'time2': time2,
                                     'result': result})
        return _uuid


class DiffQueue:
    def __init__(self, results, priorities):
        self._results = results
        self._priorities = priorities

    def __next__(self):
        self._


class Annotations:
    """
    Interface to an object store of human-entered information about diffs.

    Parameters
    ----------
    db : pymongo database
    """
    def __init__(self, db):
        self._collection = db['annotations']

    def add(self, uuid, annotation):
        """
        Record an annotation about the Result with the given uuid.
        """
        self._collection.insert_one({'uuid': str(uuid.uuid4()),
                                     'result_uuid': uuid,
                                     'created_at': time.time(),
                                     'annotation': annotation})


def compare(html1, html2):
    "Send a request to PageFreezer to compare two HTML snippets."
    URL = 'https://api1.pagefreezer.com/v1/api/utils/diff/compare'
    data = {'source': 'text',
            'url1': html1,
            'url2': html2}
    headers = {'x-api-key': os.environ['PAGE_FREEZER_API_KEY']}
    response = requests.post(URL, data=data, headers=headers)
    return response.json()


def process_next():
    snapshot_uuid = snapshots.processing_deque.popleft()
    print(snapshots[uuid])
