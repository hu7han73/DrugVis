#! python
# -*- coding: utf-8 -*-

# DrugVis
# By: Han Hu (hh255@njit.edu; https://github.com/hu7han73)
# License: BSD

import cgi
import cgitb
cgitb.enable(display=0, logdir="./log")
import json
from datetime import datetime
import pytz
# import os
# import sys
import traceback
import numpy as np
import logging
import copy

from utils import list_year, list_month, list_dates, list_weeks, list_weekdays, stopwords
from utils import get_state_fips_dict, get_states, min_max, concat_gdf, load_shpfile, clip_geoid, load_shpfiles
from db_utils import connect_to_db

# logging.basicConfig(filename='../temp/query_log',
#                     filemode='w',
#                     format='%(asctime)s,%(msecs)d %(name)s %(levelname)s %(message)s',
#                     datefmt='%H:%M:%S',
#                     level=logging.DEBUG)
root_logger= logging.getLogger()
root_logger.setLevel(logging.DEBUG)
handler = logging.FileHandler('./log/query_log.log', 'w', 'utf-8')
formatter = logging.Formatter('%(asctime)s,%(msecs)d %(name)s %(levelname)s %(message)s')
handler.setFormatter(formatter) # Pass handler as a parameter, not assign
root_logger.addHandler(handler)
      

census_years = ['2010']
utc = pytz.utc
state_dict = get_state_fips_dict()
db_map = connect_to_db('drug_viz')
db_data = connect_to_db('drug_viz_data')

MAX_KEYWORDS = 100
MAX_SAMPLES = 10

# by default, each query field is joined with "AND" logic
# to use text search and geo query, only "geowithin" can be used
# text search is always performed first, then filter conditions are considered

# the query should return the following fields:
  # the mapping data: geojson string of census tracts
  # the tweet data: each matched tweet with selected fields, include:
    # id (not the tweet id for privacy)
    # local time stamp (for time display)
    # token count (for keyword display)
    # GEOID (for align with mapping data)

# third version of main
def main3_aggregate():
  logging.info("enter main3_aggregate")
  decode_flag = False
  try:
    form = cgi.FieldStorage()
    data_str = form.getfirst('data')
    params = json.JSONDecoder().decode(data_str)
    decode_flag = True
  except Exception:
    send_response(error_resp('Query decoding had exception: {}'.format(traceback.format_exc())))
  # if incoming json decoded successfully
  if decode_flag:
    if params['queryMode'] == 'full':
      try:
        # get the geoid list (by states or geo constrains)
        geoid_list = get_geoid_list(params)
        # query mapping data
        mapping_data = get_mapping_data(params, geoid_list)
        # query tweets data
        tweets_data = get_aggregated_tweets_data_multi_coll(params, geoid_list)
        # sample some tweets
        sample_data = get_tweets_sample(params, geoid_list)
        # merge mapping and tweets data
        # final_mapping_data = merge_mapping_tweets_data_multi_coll(mapping_data, tweets_data, geoid_list)
        # send response
        # resp = wrap_response_aggregate(final_mapping_data, geoid_list)
        resp = wrap_response_aggregate(mapping_data, tweets_data, sample_data, geoid_list, params)
        send_response(resp)
      except Exception:
        logging.info('exception when query')
        send_response(error_resp(traceback.format_exc()))
    elif params['queryMode'] == 'sub':
      try:
        # get the geolist from incoming query
        geoid_list = params['geoidList']
        # get tweets data
        tweets_data = get_aggregated_tweets_data_multi_coll(params, geoid_list)
        # send response
        resp = wrap_response_sub_aggregate(tweets_data, geoid_list)
        send_response(resp)
      except Exception:
        logging.info('exception when query')
        send_response(error_resp(traceback.format_exc()))
    elif params['queryMode'] == 'sample':
      try:
        # use geoid from query
        geoid_list = [params['queryGeoID']]
        sample_data = get_tweets_sample(params, geoid_list)
        resp = wrap_sample_response(sample_data, params)
      except Exception:
        logging.info('exception when query')
        send_response(error_resp(traceback.format_exc()))
  else:
    logging.info('exception when decode')
    send_response(error_resp('Decode message failed'))
  
  return

# based on query type, get needed census tracts
def get_geoid_list(params):
  logging.info("enter get_geoid_list")
  if params['queryGeoMode'] == 'states':
    # process included states
    states = params['queryLocation']
    state_mode = params['queryLocationMode']
    state_year = params['queryCensusYear']
    if state_year not in census_years:
      # only certain years are included
      raise ValueError('Selected census year is {}, but only {} are supported'.format(state_year, census_years))
    if state_mode == 'include':
      if len(states) > 0:
        include_states = states
      else:
        # no query states are defined, return error
        raise ValueError('Query mode is "include" but no state is included in query')
    elif state_mode == 'exclude':
      include_states = set(get_states()) - set(states)
      if len(include_states) == 0:
        raise ValueError('Query mode is "exclude" but all states are included in query')
    else:
      raise ValueError('Query state mode is incorrect')
    # query census tracts
    query = {}
    query = query_mapping_states(params, include_states, query)
    results = db_map['census_tracts_{}'.format(state_year)].find(query)
    logging.info('query census tracts data: {}\n{}\n\n'.format(str(query), str(results.count())))
    GEOID_list = [r['GEOID'] for r in results]
  elif params['queryGeoMode'] == 'geo':
    GEOID_list = geo_find_census_tracts(params)
  else:
    raise ValueError('Query mode is incorrect')
  return GEOID_list

# get mapping data from list of census tracts
def get_mapping_data(params, geoid_list):
  logging.info("enter get_mapping_data")
  # build query to get census tract shapefiles
  query = {}
  query = query_mapping_geoid(params, geoid_list, query)
  # query and process results
  table = db_map['census_tracts_{}'.format(params['queryCensusYear'])]
  raw_results = table.find(query)
  logging.info('query mapping data: {}\n{}\n\n'.format(str(query), str(raw_results.count())))
  mapping_data = {}
  for x in raw_results:
    mapping_data[x['GEOID']] = {'NAME':x['NAME'],
                                'STATE':x['STATE'],
                                'COUNTY':x['COUNTY'],
                                'geo':x['geo'],
                                'center':x['center']}
    if x['POP'] <= 0:
      mapping_data[x['GEOID']]['POP'] = 1
    else:
      mapping_data[x['GEOID']]['POP'] = x['POP']
  return mapping_data

# get aggregated tweets data of geo, time, keyword, and category 
# from multiple tables
def get_aggregated_tweets_data_multi_coll(params, geoid_list):
  logging.info("enter get_aggregated_tweets_data")
  # build query to get tweets
  query = {}
  query = query_data_geoid(params, geoid_list, query)
  query = query_data_keywords(params, query)
  query = query_data_date(params, query)
  # for each collection
  coll_list = params['queryCollNames']
  if len(params['queryCollNames']) <= 0:
    raise ValueError("No collection names given")
  agg_data_dict = {}
  for coll_name in coll_list:
    # perform query
    table = db_data[coll_name]
    raw_results = table.find(query)
    logging.info('query tweets data: {}\n{}\n\n'.format(str(query), str(raw_results.count())))
    agg_dict = {}
    agg_dict['count'] = {geoid:0 for geoid in geoid_list}
    agg_dict['time'] = {'year':{}, 'month':{}, 'week':{}, 'day':{}, 'hour':{}, 'weekday':{}}
    agg_dict['timeList'] = {}
    agg_dict['keyword'] = {}
    agg_dict['drugCategory'] = {}
    min_date = datetime.strptime(params['queryDateTo'], "%Y-%m-%d")
    max_date = datetime.strptime(params['queryDateFrom'], "%Y-%m-%d")
    for x in raw_results:
      # get tweet count in each census tract
      agg_dict['count'][x['GeoID_{}'.format(params['queryCensusYear'])]] += 1
      # log time range
      if x['fakeLocalTime'] < min_date:
        min_date = copy.deepcopy(x['fakeLocalTime'])
      elif x['fakeLocalTime'] > max_date:
        max_date = copy.deepcopy(x['fakeLocalTime'])
      # get time count for each time frame
      time_keys = {
        'year': x['fakeLocalTime'].strftime('%Y'),
        'month': x['fakeLocalTime'].strftime('%b-%y'),
        'week' : x['fakeLocalTime'].strftime('W%U-%y'),
        'day'  : x['fakeLocalTime'].strftime('%m-%d-%y'),
        'hour' : x['fakeLocalTime'].strftime('%H'),
        'weekday' : x['fakeLocalTime'].strftime('%a')
      }
      for t in time_keys:
        if time_keys[t] not in agg_dict['time'][t]:
          agg_dict['time'][t][time_keys[t]] = 0
        agg_dict['time'][t][time_keys[t]] += 1
      # get keyword count for top keywords
      for key in x['textTokenCounts']:
        if key not in agg_dict['keyword']:
          agg_dict['keyword'][key] = 0
        agg_dict['keyword'][key] += 1
      # get categoty count
      for cat in x['drugCategory']:
        if cat not in agg_dict['drugCategory']:
          agg_dict['drugCategory'][cat] = 0
        agg_dict['drugCategory'][cat] += 1
    # all results iterated
    # process time list
    min_date = min_date.strftime("%Y-%m-%d")
    max_date = max_date.strftime("%Y-%m-%d")
    agg_dict['timeList']['year'] = list_year(min_date, max_date)
    agg_dict['timeList']['month'] = list_month(min_date, max_date)
    agg_dict['timeList']['week'] = list_weeks(min_date, max_date)
    agg_dict['timeList']['day'] = list_dates(min_date, max_date)
    agg_dict['timeList']['hour'] = ['{:02d}'.format(h) for h in range(24)]
    agg_dict['timeList']['weekday'] = list_weekdays(min_date, max_date)
    # select top keywords
    sorted_keywords = sorted([(k, agg_dict['keyword'][k]) for k in agg_dict['keyword']], key=lambda x:x[1], reverse=True)[:500]
    agg_dict['keyword'] = {}
    for i in range(len(sorted_keywords)):
      w = sorted_keywords[i][0]
      if w.lower() not in stopwords:
        agg_dict['keyword'][w] = sorted_keywords[i][1]
        if len(agg_dict['keyword']) >= MAX_KEYWORDS:
          break
    agg_data_dict[coll_name] = agg_dict
  return agg_data_dict

# def merge_mapping_tweets_data_multi_coll(mapping_data, tweets_data_dict, geoid_list):
#   for geoid in geoid_list:
#     for key in tweets_data_dict:
#       mapping_data[geoid]['count_{}'.format(key)] = tweets_data_dict[key]['geo'][geoid]
#       mapping_data[geoid]['countNorm_{}'.format(key)] = tweets_data_dict[key]['geo'][geoid]
#   return mapping_data

def get_tweets_sample(params, geoid_list):
  query = {}
  query = query_data_geoid(params, geoid_list, query)
  query = query_data_keywords(params, query)
  query = query_data_date(params, query)
  sample_data_dict = {}
  # sample_data_dict[geoid_list[0]] = {}
  for coll_name in params['queryCollNames']:
    # perform query
    table = db_data[coll_name]
    raw_results = table.find(query)
    num_results = table.count_documents(query)
    logging.info('sample tweets data: {}\n{}\n\n'.format(str(query), str(raw_results.count())))
    samples = []
    # if small number of results is returned
    if num_results < MAX_SAMPLES:
      for x in raw_results:
        samples.append({
          'localTime': x['fakeLocalTime'].strftime("%Y-%m-%d"),
          'tweetNorm': x['textNorm']
        })
    else:
      idx = np.random.choice(num_results, MAX_SAMPLES, replace=False)
      i = 0
      for x in raw_results:
        if i in idx:
          samples.append({
            'localTime': x['fakeLocalTime'].strftime("%Y-%m-%d"),
            'tweetNorm': x['textNorm']
          })
        i += 1
    # sample_data_dict[geoid_list[0]][coll_name] = samples
    sample_data_dict[coll_name] = samples
  return sample_data_dict

# wrap the response with needed information for front end
# def wrap_response2(mapping_data, tweets_data):
#   logging.info("wrapping resp")
#   resp = {'type':'queryResults',
#           'mapping_data':mapping_data,
#           'tweets_data':tweets_data}
#   return resp

def wrap_response_aggregate(mapping_data, tweets_data, sample_data, geoid_list, params):
  logging.info("wrapping resp")
  resp = {'type':'queryResults',
          'queryID': params['queryID'],
          'mappingData': mapping_data,
          'tweetsData': tweets_data,
          'sampleData': sample_data,
          'geoidList':geoid_list}
  return resp

def wrap_response_sub_aggregate(subquery_data, geoid_list):
  logging.info("wrapping resp")
  resp = {'type':'queryResults',
          'tweetsData':subquery_data,
          'geoidList':geoid_list}
  return resp

def wrap_sample_response(sample_data, params):
  logging.info("warpping resp")
  resp = {'type':'sampleResults',
          'queryID': params['queryID'],
          'sampleData': sample_data,
          'geoID':params['queryGeoID']}
  return resp


# format error response
def error_resp(message):
  resp = {}
  resp['type'] = 'queryError'
  resp['message'] = message
  return resp

#==================================================================
# set up query for keywords
def query_data_keywords(params, query):
  # separate keywords
  keywords = [x.strip() for x in params['queryKeywords'].split(',')]
  keyword_mode = params['queryKeywordMode']
  # put keywords into query
  if len(keywords) <= 1 and keywords[0] == "":
    pass
  else:
    if keyword_mode == 'fulltext':
      query['$text'] = {'$search': ' '.join(keywords)}
    elif keyword_mode == 'phrase':
      query['$text'] = {'$search': ' '.join(["\"{}\"".format(k) for k in keywords])}
    elif keyword_mode == 'exact':
      query['textTokens'] = {'$all': keywords}
    else:
      raise ValueError('Incorrect text mode')
  return query

# setup query for date
def query_data_date(params, query):
  # process dates
  date_mode = params['queryDateMode']
  date_from = datetime(year=int(params['queryDateFrom'][0:4]),
                       month=int(params['queryDateFrom'][5:7]),
                       day=int(params['queryDateFrom'][8:10]),
                       tzinfo=utc)
  date_to = datetime(year=int(params['queryDateTo'][0:4]),
                       month=int(params['queryDateTo'][5:7]),
                       day=int(params['queryDateTo'][8:10]),
                       hour=23, minute=59, second=59,
                       microsecond=999999, tzinfo=utc)
  # put date into query
  if date_mode == 'local':
    query['fakeLocalTime'] = {'$gte':date_from, '$lte':date_to}
  elif date_mode == 'utc':
    query['fakeLocalTime'] = {'$gte':date_from, '$lte':date_to}
  else:
    raise ValueError('Incorrect date mode')
  return query

# build query with list of geoids
def query_data_geoid(params, ct_geoids, query):
  year = params['queryCensusYear']
  # query tweets that are in list of censes tracts
  query['GeoID_{}'.format(year)] = {'$in': ct_geoids}
  return query

# build query with list of geoids
def query_mapping_geoid(params, ct_geoids, query):
  year = params['queryCensusYear']
  # query tweets that are in list of censes tracts
  query['GEOID'] = {'$in': ct_geoids}
  return query

# setup query states
def query_mapping_states(params, states, query):
  # location
  state_fips = [state_dict[s] for s in states]
  query['STATE'] = {'$in': state_fips}
  if int(params['queryPopLimit']) > 0:
    query['POP'] = {'$gte': int(params['queryPopLimit'])}
  return query

# turn query into pipeline
# that query tweets then group count
# finally join with census tracks
def query_make_pipeline(params, query):
  year = params['queryCensusYear']
  pipeline = []
  pipeline.append({"$match": query})
  pipeline.append({"$group": {
    "_id": "$GeoID_{}".format(year),
    "tweet_count": {"$sum":1}
  }})
  pipeline.append({"$lookup":{
    "from": "census_tracts_{}".format(year),
    "localField": "_id",
    "foreignField": "GEOID",
    "as": "ct_info"
  }})
  return pipeline

# setup query limit
def query_limit(params, query):
  # wrap the query with $match and $sample to make it for aggregate
  return query

#======================================
# geo query stuff

# find census tracts to query
def geo_find_census_tracts(params):
  year = params['queryCensusYear']
  if params['queryGeoType'] == 'circle':
    return geo_query_circle(params, year)
  elif params['queryGeoType'] == 'polygon':
    return geo_query_polygon(params, year)
  elif params['queryGeoType'] == 'rectangle':
    return geo_query_rect(params, year)
  else:
    raise ValueError

def geo_query_circle(params, year):
  # query census tracts
  geo_table = db_map['census_tracts_{}'.format(year)]
  circle = params['queryGeoInfo'] # (lat, lon, distance)
  ct_query = {
    'geo':{
      '$nearSphere':{
        '$geometry':{
          'type': 'Point',
          'coordinates': [float(circle[1]), float(circle[0])] # lon, lat
        },
        '$maxDistance': float(circle[2]),
        '$minDistance': 0.0
      }
    }
  }
  if int(params['queryPopLimit']) > 0:
    ct_query['POP'] = {'$gte': int(params['queryPopLimit'])}
  ct_geoids = [x['GEOID'] for x in geo_table.find(ct_query)]
  return ct_geoids

def geo_query_polygon(params, year):
  # query census tracts
  geo_table = db_map['census_tracts_{}'.format(year)]
  raw_poly = params['queryGeoInfo'] # list of dicts
  poly = [[x['lng'], x['lat']] for x in raw_poly[0]]
  poly.append(poly[0])
  ct_query = {'geo':{'$geoIntersects':{
    '$geometry':{
      'type': 'Polygon',
      'coordinates': [poly] # double nest
    }
  }}}
  if int(params['queryPopLimit']) > 0:
    ct_query['POP'] = {'$gte': int(params['queryPopLimit'])}
  ct_geoids = [x['GEOID'] for x in geo_table.find(ct_query)]
  return ct_geoids

def geo_query_rect(params, year):
  # query census tracts
  geo_table = db_map['census_tracts_{}'.format(year)]
  raw_poly = params['queryGeoInfo'] # list of dicts
  poly = [[x['lng'], x['lat']] for x in raw_poly[0]]
  poly.append(poly[0])
  ct_query = {'geo':{'$geoIntersects':{
    '$geometry':{
      'type': 'Polygon',
      'coordinates': [poly] # double nest
    }
  }}}
  if int(params['queryPopLimit']) > 0:
    ct_query['POP'] = {'$gte': int(params['queryPopLimit'])}
  ct_geoids = [x['GEOID'] for x in geo_table.find(ct_query)]
  return ct_geoids

#=============================================
# wrap responce with type
# def wrap_response(resp):
#   wrap = {}
#   wrap['type'] = 'queryResults'
#   wrap['data'] = resp
#   return wrap

# encode and print(send) responce
def send_response(resp):
  try:
    logging.info('sending resp')
    # logging.info(json.JSONEncoder().encode(resp))
    print("Content-type: application/json\n\n")
    logging.info('resp head sent')
    print(json.JSONEncoder().encode(resp))
    logging.info('resp sent')
  except Exception:
    logging.info('error when sending resp: {}'.format(traceback.format_exc()))

if __name__ == "__main__":
  # main2()
  main3_aggregate()
  # debug_main()