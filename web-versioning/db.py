import uuid
import requests
import hashlib
import time
import sqlalchemy
import pymongo
import sqlite3
import csv


SQL_DB_URI = 'sqlite3://'
MONGO_DB_URI = 'mongodb://localhost:27017/'
engine = sqlalcehmy.create_engine(SQL_DB_URI)
client = pymongo.MongoClient(MONGO_URI)


def create(csv_filepath):
    conn = engine.connect(':memory:')
    c = conn.cursor()
    c.execute("CREATE TABLE Snapshots ("
              "uuid TEXT NOT NULL PRIMARY KEY, "
              "url TEXT NOT NULL, "
              "capture_time DATETIME NOT NULL,"
              "path TEXT NOT NULL,"
              ");")
    c.commit()
    c.close()
    conn.close()


class Snapshots:
    """
    Interface to a table associating URLs and capture dates with filepaths.

    Parameters
    ----------
    conn : sqlalchemy Connection
    """
    def __init__(self, conn):
        self._conn = conn

    def add(self, url, capture_time, path):
        c = self._connection.cursor()
        c.execute("INSERT INTO Snapshots (uuid, url, capture_time, path) "
                  "VALUES "
                  "(?, ?, ?, ?);", (uuid.uuid4(), url, capture_time, path))


class Results:
    """
    Interface to an object store of PageFreezer(-like) results.

    Parameters
    ----------
    db : pymongo database
    """
    def __init__(self, db):
        self._collection = db['page_freezer_results_v1']

    def add(self, url1, time1, url2, time2, result):
        diff = str(result['result']['diff'])
        diffhash = hashlib.sha256(diff).hexdigest()
        self._collection.insert_one({'uuid': uuid.uuid4(),
                                     'diffhash': diffhash,
                                     'created_at': time.time(),
                                     'url1': url1,
                                     'url2': url2,
                                     'time1': time1,
                                     'time2': time2,
                                     'result': result})


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
        self._collection.insert_one({'uuid': uuid.uuid4(),
                                     'result_uuid': uuid,
                                     'created_at': time.time(),
                                     'annotation': annotation})


def compare(html1, html2)
    "Send a request to PageFreezer to compare two HTML snippets."
    URL = 'https://api1.pagefreezer.com/v1/api/utils/diff/compare'
    data = {'source': 'text',
            'url1': html1,
            'url2': html2}
    headers = {'x-api-key': os.environ['PAGE_FREEZER_API_KEY']}
    response = requests.post(URL, data=data, headers=headers)
    return response.json()
