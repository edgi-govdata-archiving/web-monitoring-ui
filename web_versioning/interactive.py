import functools
from datetime import datetime, timedelta
import os

import sqlalchemy
import pymongo
from web_versioning.db import (Pages, Snapshots, Results, Annotations, create,
                               compare, NoAncestor, diff_snapshot)


SQL_DB_URI = 'sqlite://'
MONGO_DB_URI = 'mongodb://localhost:27017/'
MONGO_DB_NAME = 'page_freezer_v1'
engine = sqlalchemy.create_engine(SQL_DB_URI)
client = pymongo.MongoClient(MONGO_DB_URI)

create(engine)
results = Results(client[MONGO_DB_NAME])
Annotations = Annotations(client[MONGO_DB_NAME])
snapshots = Snapshots(engine.connect())
pages = Pages(engine.connect())


def load_examples():
    EXAMPLES = [
        'falsepos-footer',
        'falsepos-num-views',
        'falsepos-small-changes',
        'truepos-dataset-removal',
        'truepos-image-removal',
        'truepos-major-changes',
    ]
    archives_dir = os.path.join('archives')
    time1 = datetime.now()
    time0 = time1 - timedelta(days=1)
    for example in EXAMPLES:
        simulated_url = 'https://examples.com/{}.html'.format(example)
        page_uuid = pages.insert(simulated_url)
        for suffix, _time in (('-a.html', time0), ('-b.html', time1)):
            filename = example + suffix
            path = os.path.abspath(os.path.join(archives_dir, filename))
            snapshots.insert(page_uuid, _time, path)


def parse_pagefreezer_xml():
    # format = '%Y-%m-%d %I:%M %p'
    ...


def diff_new_snapshots():
    f = functools.partial(diff_snapshot, snapshots=snapshots, results=results)
    while True:
        # Get the uuid of a Snapshot to be processed.
        try:
            snapshot_uuid = snapshots.unprocessed.popleft()
        except IndexError:
            # nothing left to process
            return
        try:
            f(snapshot_uuid)
        except NoAncestor:
            # This is the oldest Snapshot for this Page -- nothing to compare.
            continue
