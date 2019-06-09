# DrugVis
# By: Han Hu (hh255@njit.edu; https://github.com/hu7han73)
# License: BSD

import pymongo

# def connect_to_db(db, collection):
#   client = pymongo.MongoClient('localhost', 27017)
#   db = client[db]
#   collection = db[collection]
#   return collection

def connect_to_db(db):
  client = pymongo.MongoClient('localhost', 27017)
  db = client[db]
  return db

def clear_collection(table):
  table.drop()