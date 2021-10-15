#!/usr/bin/env python
"""Script that downloads a public dataset and streams it to an Elasticsearch cluster"""

import os
import sys
import csv
import tqdm
import json
import gzip
import urllib3
from datetime import datetime
from elasticsearch import Elasticsearch
from elasticsearch.helpers import streaming_bulk
from elasticsearch_dsl import Search
from ast import literal_eval

DATASET_PATH = "/home/chrissy/bjorn/test_scatter/new_api_data.json"

def load_json_data():
    data = []
    failed = 0
    with gzip.open(DATASET_PATH, 'rb') as jsonfile:
        for line in jsonfile:
            try:
                data.append(json.loads(line))
            except:
                failed += 1
            
    print("Number of Records: ", len(data))
    print("Number of Failures: %s" %failed)
    return(data)

def create_index(client):
    """Creates an index in Elasticsearch if one isn't already there."""
    client.indices.create(
        index="hcov19",
        body={
            "settings": {"number_of_shards": 1},
            "mappings": {
                "properties": {
                    "strain": {"type": "text"},
                    "accession_id": {"type": "text"},
                    "pangolin_lineage": {"type": "text"},
                    "date_collected": {"type": "text"},
                    "country_id": {"type": "text"},
                    "division_id" : {"type":"text"},
                    "location_id" : {"type":"text"},
                    "date_modified":{"type":"text"},
                    "mutations": {"type": "nested"},
                }
            },
        },
        ignore=400,
    ) 

def generate_actions(data):
    """Reads the file through csv.DictReader() and for each row
    yields a single document. This function is passed into the bulk()
    helper to create many documents in sequence.
    """
    for row in data:
        row["_id"] = row['strain'].replace('/','-')
        yield row

def search(client):
    search = Search().using(client).query("match", date_collected="2021-03-01")
    response = search.execute()
    print(response)

def main():
    print("Loading data...")
    data = load_json_data()
    #print(data[0])
    client = Elasticsearch()
    search(client)
    sys.exit(0)
     
    print("Creating an index...")
    create_index(client)
  
    print("Indexing documents...")
    progress = tqdm.tqdm(unit="docs", total=len(data))
    successes = 0
    for ok, action in streaming_bulk(
        client=client, index="hcov19", actions=generate_actions(data),
    ):
        progress.update(1)
        successes += ok
    print("Indexed %d/%d documents" % (successes, len(data)))

if __name__ == "__main__":
    main()
