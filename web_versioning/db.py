# This module implements Python classes that provide a restricted and validated
# interface to several databases.

# Pages: associates a URL with agency metadata
# Snapshots: assocates an HTML snapshot at a specific time with a Page
# Results: stores a PageFreezer (or PageFreezer-like) result for a diff of two
#          Snapshots along with a hash of that diff
# Annotations: Human-entered information about a Result
#
# The Pages and Snapshots are implemented with a SQL database because it is
# thought that their schemas will rarely change. The Reults and Annotations are
# implemented with a NoSQL (MongoDB) database because they are nested structues
# and their schemas are in flux.

import os
import datetime
import collections
import uuid
import json
import hashlib
import time
import csv

import requests
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

    Parameters
    ----------
    engine : sqlalchemy.engine.Engine
    """
    nt = collections.namedtuple('Page', 'uuid url title agency site')
    def __init__(self, engine):
        self._engine = engine
        meta = sqlalchemy.MetaData(engine)
        self._table = sqlalchemy.Table('Pages', meta, autoload=True)

    def insert(self, url, title='', agency='', site=''):
        """
        Insert a new Page into the database.

        This is a prerequisite to storing any Snapshots of the Page.

        Parameters
        ----------
        url : string
        title : string, optional
        agency : string, optional
        site : string, optional

        Returns
        -------
        uuid : string
            unique identifer assigned to this page
        """
        _uuid = str(uuid.uuid4())
        values = (_uuid, url, title, agency, site, datetime.datetime.utcnow())
        self._engine.execute(self._table.insert().values(values))
        return _uuid

    def __getitem__(self, uuid):
        "Look up a Page by its uuid."
        result = self._engine.execute(
            self._table.select().where(self._table.c.uuid == uuid)).fetchone()
        # Pack the result in a namedtuple, stripping off created_at which is
        # only for internal database debugging / recovery.
        return self.nt(*result[:-1])

    def by_url(self, url):
        """
        Find a Page by its url.
        """
        proxy = self._engine.execute(
            self._table.select()
            .where(self._table.c.url == url))
        result = proxy.fetchone()
        # Pack the result in a namedtuple, stripping off created_at which is
        # only for internal database debugging / recovery.
        return self.nt(*result[:-1])


class Snapshots:
    """
    Interface to a table associating an HTML snapshot at some time with a Page.

    Parameters
    ----------
    engine : sqlalchemy.engine.Engine
    """
    unprocessed = collections.deque()
    nt = collections.namedtuple('Snapshot', 'uuid page_uuid capture_time path')

    def __init__(self, engine):
        self._engine = engine
        meta = sqlalchemy.MetaData(engine)
        self._table = sqlalchemy.Table('Snapshots', meta, autoload=True)

    def insert(self, page_uuid, capture_time, path):
        """
        Insert a new Snapshot into the database.

        Parameters
        ----------
        page_uuid : string
            referring to the Page that corresponds to this Snapshot
        capture_time : datetime.datetime
        path : string
            e.g., filepath to HTML file on disk or some other resource locator

        Returns
        -------
        uuid : string
            unique identifer assigned to this page
        """
        _uuid = str(uuid.uuid4())
        values = (_uuid, page_uuid, capture_time, path,
                  datetime.datetime.utcnow())
        self._engine.execute(self._table.insert().values(values))
        self.unprocessed.append(_uuid)
        return _uuid

    def __getitem__(self, uuid):
        "Look up a Snapshot by its uuid."
        result = self._engine.execute(
            self._table.select().where(self._table.c.uuid == uuid)).fetchone()
        # Pack the result in a namedtuple, stripping off created_at which is
        # only for internal database debugging / recovery.
        return self.nt(*result[:-1])

    def history(self, page_uuid):
        """
        Lazily yield Snapshots for a given Page in reverse chronological order.
        """
        proxy = self._engine.execute(
            self._table.select()
            .where(self._table.c.page_uuid == page_uuid)
            .order_by(sqlalchemy.desc(self._table.c.capture_time)))
        while True:
            result = proxy.fetchone()
            if result is None:
                raise StopIteration
            # As above, use a namedtuple and omit created_at.
            yield self.nt(*result[:-1])

    def oldest(self, page_uuid):
        """
        Return the oldest Snapshot for a given Page.
        """
        proxy = self._engine.execute(
            self._table.select()
            .where(self._table.c.page_uuid == page_uuid)
            .order_by(self._table.c.capture_time))
        result = proxy.fetchone()
        # As above, use a namedtuple and omit created_at.
        return self.nt(*result[:-1])


class Results:
    """
    Interface to an object store of PageFreezer(-like) results.

    Parameters
    ----------
    db : pymongo database
    """
    unprocessed = collections.deque()

    def __init__(self, db):
        self._collection = db['page_freezer_results_v1']

    def insert(self, snapshot1_uuid, snapshot2_uuid, result):
        diffs = result['output']['diffs']
        diffhash = hashlib.sha256(str(diffs).encode()).hexdigest()
        _uuid = str(uuid.uuid4())
        self._collection.insert_one({'uuid': _uuid,
                                     'diffhash': diffhash,
                                     'created_at': time.time(),
                                     'uuid1': snapshot1_uuid,
                                     'uuid2': snapshot2_uuid,
                                     'result': result})
        self.unprocessed.append(_uuid)
        return _uuid


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
    """
    Send a request to PageFreezer to compare two HTML snippets.

    Parameters
    ----------
    html1 : string
    html2 : string

    Returns
    -------
    response : dict
    """
    URL = 'https://api1.pagefreezer.com/v1/api/utils/diff/compare'
    data = {'source': 'text',
            'url1': html1,
            'url2': html2}
    headers = {'x-api-key': os.environ['PAGE_FREEZER_API_KEY'],
               'Accept': 'application/json',
               'Content-Type': 'application/json', }
    response = requests.post(URL, data=json.dumps(data), headers=headers)
    return response.json()


def diff_snapshot(snapshot_uuid, snapshots, results):
    """
    Compare a snapshot with its ancestor and store the result.

    It might be convenient to use ``functools.partial`` to bind this to
    specific instances of Snapshots and Results.

    Parameters
    ----------
    snapshot_uuid : string
    snapshots : Snapshots
    results : Results
    """
    # Retrieve the Snapshot for the database.
    snapshot = snapshots[snapshot_uuid]

    # Find its ancestor to compare with.
    ancestor = snapshots.oldest(snapshot.page_uuid)
    if ancestor == snapshot:
        # This is the oldest one we have -- nothing to compare!
        raise NoAncestor("This is the oldest Snapshot available for the Page "
                         "with page_uuid={}".format(snapshot.page_uuid))
    html1 = open(ancestor.path).read()
    html2 = open(snapshot.path).read()
    result = compare(html1, html2)  # PageFreezer API call
    if result['status'] != 'ok':
        raise PageFreezerError("result status is not 'ok': {}"
                                "".format(result['status']))
    results.insert(ancestor.uuid, snapshot.uuid, result['result'])


# Some custom Exceptions:

class PageFreezerError(Exception):
    ...


class NoAncestor(Exception):
    ...


