import datetime
import collections
import uuid
import requests
import hashlib
import time
import csv
import sqlalchemy
import pymongo

# These schemas were informed by work by @Mr0grog at
# https://github.com/edgi-govdata-archiving/webpage-versions-db/blob/master/db/schema.rb
PAGES_COLUMNS = (
    sqlalchemy.Column('uuid', sqlalchemy.Text, primary_key=True),
    sqlalchemy.Column('url', sqlalchemy.Text),
    sqlalchemy.Column('title', sqlalchemy.Text),
    sqlalchemy.Column('agency', sqlalchemy.Text),
    sqlalchemy.Column('site', sqlalchemy.Text),
    sqlalchemy.Column('created_at', sqlalchemy.DateTime,
                      default=datetime.datetime.utcnow),
)

SNAPSHOTS_COLUMNS = (
    sqlalchemy.Column('uuid', sqlalchemy.Text, primary_key=True),
    sqlalchemy.Column('page_uuid', sqlalchemy.Text),
    sqlalchemy.Column('capture_time', sqlalchemy.DateTime),
    sqlalchemy.Column('path', sqlalchemy.Text),
    sqlalchemy.Column('created_at', sqlalchemy.DateTime,
                      default=datetime.datetime.utcnow),
)


def create(engine):
    meta = sqlalchemy.MetaData(engine)
    sqlalchemy.Table("Pages", meta, *PAGES_COLUMNS)
    sqlalchemy.Table("Snapshots", meta, *SNAPSHOTS_COLUMNS)
    meta.create_all()


class Pages:
    """
    Interface to a table associating a URL with agency metadata.
    """
    def __init__(self, engine):
        self._engine = engine
        meta = sqlalchemy.MetaData(engine)
        self._table = sqlalchemy.Table('Pages', meta, autoload=True)

    def insert(self, url, title='', agency='', site=''):
        _uuid = str(uuid.uuid4())
        values = (_uuid, url, title, agency, site, datetime.datetime.utcnow())
        self._engine.execute(self._table.insert().values(values))
        return _uuid


class Snapshots:
    """
    Interface to a table associating an HTML snapshot at some time with a Page.

    Parameters
    ----------
    conn : sqlalchemy Connection
    """
    processing_deque = collections.deque()
    nt = collections.namedtuple('Snapshot', 'uuid page_uuid capture_time path')

    def __init__(self, engine):
        self._engine = engine
        meta = sqlalchemy.MetaData(engine)
        self._table = sqlalchemy.Table('Snapshots', meta, autoload=True)

    def insert(self, page_uuid, capture_time, path):
        _uuid = str(uuid.uuid4())
        values = (_uuid, page_uuid, capture_time, path,
                  datetime.datetime.utcnow())
        self._engine.execute(self._table.insert().values(values))
        self.processing_deque.append(_uuid)
        return _uuid

    def __getitem__(self, uuid):
        "instance[uuid] -> namedtuple"
        result = self._engine.execute(
            self._table.select().where(self._table.c.uuid == uuid)).fetchone()
        return result
        return self.nt(*result)


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
