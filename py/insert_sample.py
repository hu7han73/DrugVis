# DrugVis
# By: Han Hu (hh255@njit.edu; https://github.com/hu7han73)
# License: BSD

import os
# change this path
os.environ['GDAL_DATA'] = 'D:/DEV/Anaconda/Lib/site-packages/osgeo/data/gdal'

from multiprocessing import Process, Manager
import pandas as pd
from geopandas import GeoDataFrame
import geopandas as gpd
from shapely.geometry import Point
import fiona
import geojson
import json
# from zipfile import ZipFile
# from io import BytesIO, TextIOWrapper
import sys
import time
import math
from datetime import datetime
import numpy.random as random
import pymongo
import numpy as np
from pytz import timezone
import pytz
from timezonefinderL import TimezoneFinder
import html
# from pattern.en import lemma
from twokenize import normalizeTextForTagger, tokenize
from shapely.wkt import loads
from collections import Counter
import itertools

from utils import get_state_fips_list, replace_sp_tokens, read_drug_category, read_stopwords, get_tokens
from db_utils import connect_to_db, clear_collection

time_format = "%a %b %d %H:%M:%S %z %Y"
time_format_db = "%Y-%m-%d %H:%M:%S"
drug_category = read_drug_category()
stopwords = set(read_stopwords())
stopwords.add('%URL%')
stopwords.add('%USER_MENTION%')
stopwords.add('%QUOTES%')

def to_Point(x):
  return Point(geojson.loads(x)['coordinates'])

def list_shpfiles():
  state_fips_list = get_state_fips_list()
  home_path = '../shpfiles/census_tracts_simple_2010/'
  filename_temp = 'gz_2010_{}_140_00_500k.zip'
  path_list = []
  for f in state_fips_list:
    path = home_path + filename_temp.format(f)
    if not os.path.isfile(path):
      raise FileNotFoundError('{} not found'.format(path))
      return None
    else:
      path_list.append(path)
  print('Scan complete, found census tract shapefiles of {} states'.format(len(state_fips_list)))
  return path_list

def load_shpfiles():
  def clip_geoid(x):
    return x[9:]
  # read shapefiles as geodataframes
  path_list = list_shpfiles()
  main_crs = None
  gdf_list = []
  s_time = time.time()
  total_cts = 0
  print('loading shapefiles')
  for path in path_list:
    # print(path)
    inf = open(path, 'rb')
    direct = inf.read()
    with fiona.BytesCollection(direct) as f:
      crs = f.crs
      ct_gdf = gpd.GeoDataFrame.from_features(f, crs=crs)
      # print("Shape of the ct_gdf: {}".format(ct_gdf.shape))
      # print("Projection of ct_gdf: {}".format(ct_gdf.crs))
      ct_gdf = ct_gdf.to_crs({'init': 'epsg:4326'})
      # print("Projection of ct_gdf: {}".format(ct_gdf.crs))
      if not main_crs:
        main_crs = ct_gdf.crs
      gdf_list.append(ct_gdf)
      total_cts += ct_gdf.shape[0]
    inf.close()
  print('loading done, takes {} seconds'.format(time.time()-s_time))
  print('{} states shpfiles are loaded, {} census tracts'.format(len(gdf_list), total_cts))
  # concat all geodataframes
  all_gdf = gpd.GeoDataFrame(pd.concat(gdf_list, ignore_index=True), crs=main_crs)
  all_gdf['GEOID'] = all_gdf['GEO_ID'].apply(clip_geoid)
  print("Shape of the all_gdf: {}".format(all_gdf.shape))
  print("Projection of all_gdf: {}".format(all_gdf.crs))
  # print(all_gdf.loc[all_gdf['GEOID'] == '47053966500'])
  return all_gdf, main_crs

def load_tweets(p):
  df = pd.read_csv(p)
  print('Shape of the df: {}'.format(df.shape))
  return df

def load_tweets_as_gdf(p, main_crs):
  df = pd.read_csv(p)
  print('Shape of the df: {}'.format(df.shape))
  df['geometry'] = df['infered_point'].apply(to_Point)
  tweet_gdf = gpd.GeoDataFrame(df, crs=main_crs)
  return tweet_gdf

def load_tweets_from_json(p):
  with open(p, 'r', encoding='utf-8') as inf:
    j_str = inf.readline()
  return json.loads(j_str)

# def load_tweets_with_coord_from_json_as_gdf(p, main_crs):
#   with open(p, 'r', encoding='utf-8') as inf:
#     j_obj = json.loads(inf.readline())
#   d = {'tweet_obj':j_obj}

def load_census_concat():
  census_home_path = '../data/census_2010/'
  census_filename = 'all_140_in_{}.P1.csv'
  state_fips_list = get_state_fips_list()
  census_df_list = []
  total_cts = 0
  for s in state_fips_list:
    census_data = pd.read_csv(census_home_path + census_filename.format(s), 
      usecols=['GEOID', 'POP100'], dtype={'GEOID':str, 'POP100':float})
    # census_data = census_data[['GEOID', 'POP100']]
    # census_data['GEOID'] = census_data['GEOID'].astype('str')
    # census_data['POP100'] = census_data['POP100'].replace(0, np.nan)
    census_df_list.append(census_data)
    total_cts += census_data.shape[0]
    # print(census_data.shape)
  print('{} states census data are loaded, {} census tracts'.format(len(census_df_list), total_cts))
  all_census_df = pd.concat(census_df_list)
  print("shape of concat census df: {}".format(all_census_df.shape))
  # print(all_census_df.shape)
  # print(all_census_df.head().to_string())
  # print(all_census_df.columns)
  # print(all_census_df.loc[all_census_df['GEOID'] == '47053966500'])
  return all_census_df

# join census data with shpfile, get a geodataframe with population and geometry
def join_census_shpfile(all_gdf, census_df):
  pop_gdf = all_gdf.merge(census_df, on='GEOID')
  return pop_gdf

# join tweets with already joined census data and shpfiles
def join_tweets_pop_gdf(pop_gdf, tweet_gdf):
  join_gdf = gpd.sjoin(tweet_gdf, pop_gdf, how='left', op='within', lsuffix='left', rsuffix='right')
  return join_gdf

def join_tweets_shpfiles(all_gdf, main_crs, tweet_gdf):
  print('doing join')
  s_time = time.time()
  join_gdf = gpd.sjoin(tweet_gdf, all_gdf, how='left', op='within', lsuffix='left', rsuffix='right')
  print('join done, takes {} seconds'.format(time.time()-s_time))
  print('Shape of the join_gdf: {}'.format(join_gdf.shape))
  print(join_gdf.head().to_string())
  print(join_gdf.columns)
  return join_gdf

def join_tweets_shpfiles_census(all_gdf, main_crs, tweet_gdf, census_df):
  # check shapefiles and census files
  all_shp_geoids = set(all_gdf['GEOID'].tolist())
  all_census_geoids = set(census_df['GEOID'].tolist())
  # with open('../temp/geoid_list', 'w') as outf:
  #   a = sorted(list(all_shp_geoids - all_census_geoids))
  #   b = sorted(list(all_census_geoids - all_shp_geoids))
  #   c = sorted(list(all_shp_geoids & all_census_geoids))
  #   outf.write('in shp but not in census: {}, size: {}\n'.format(a, len(a)))
  #   outf.write('in census but not in shp: {}, size: {}\n'.format(b, len(b)))
  #   outf.write('in both: {}, size: {}\n'.format(c, len(c)))
  # exit()
  # first join gdf and census data
  # make sure GEOID and 0 pop are preprocessed
  print('doing shapefile x census file join')
  ct_pop_gdf = all_gdf.merge(census_df, on='GEOID')
  print(ct_pop_gdf.shape)
  print(ct_pop_gdf.crs)
  # then join gdf with tweet df
  print('doing shapefile x tweets join')
  s_time = time.time()
  join_gdf = gpd.sjoin(tweet_gdf, ct_pop_gdf, how='left', op='within', lsuffix='left', rsuffix='right')
  print(join_gdf.crs)
  print('join done, takes {} seconds'.format(time.time()-s_time))
  print('Shape of the join_gdf: {}'.format(join_gdf.shape))
  # print(join_gdf.head().to_string())
  print(join_gdf.columns)
  return join_gdf


# def test_df():
#   df = pd.read_csv('../examples/positive_tweets_sample_loc_time.csv')
#   df['geometry'] = df['infered_point'].apply(to_Point)
#   print(df['infered_point'].iloc[0])
#   print(geojson.loads(df['infered_point'].iloc[0])['coordinates'][0])
#   print(geojson.loads(df['infered_point'].iloc[0])['coordinates'][1])

#   print(df['geometry'].iloc[0])
#   print(df['geometry'].iloc[0].x) # lon
#   print(df['geometry'].iloc[0].y) # lat

# test_df()
# exit()

def test_join(pos_tweet_path):
  all_gdf, main_crs = load_shpfiles()
  pos_tweet_gdf = load_tweets_as_gdf(pos_tweet_path, main_crs)
  pos_tweet_gdf['geometry'].iloc[0] = Point(-80.0, 60.0)
  print(pos_tweet_gdf.iloc[0])
  pos_join_gdf = join_tweets_shpfiles(all_gdf, main_crs, pos_tweet_gdf)
  pos_join_gdf = pos_join_gdf.head()
  print(pos_join_gdf.shape)
  print(pos_join_gdf.iloc[0])
  print(pos_join_gdf['GEOID'].iloc[0])
  print(type(pos_join_gdf['GEOID'].iloc[0]))
  print(type(pos_join_gdf['GEOID'].iloc[1]))

  pos_join_gdf = pos_join_gdf.loc[~pos_join_gdf['GEOID'].isnull()]
  print(pos_join_gdf.shape)
  print(pos_join_gdf.iloc[0])
  print(pos_join_gdf['GEOID'].iloc[0])
  print(type(pos_join_gdf['GEOID'].iloc[0]))
  print(type(pos_join_gdf['GEOID'].iloc[1]))

# test_join('../examples/positive_tweets_sample_loc_time.csv')
# exit()


def parse_fields_2017_coord(tweet_obj):
  # parse files of 2017 data, where coord exists
  tzfinder = TimezoneFinder()
  utc = pytz.utc
  
  def parse_text(tw_obj):
    # remove use mentions, urls from the text
    # use extended tweet if presents
    if 'extended_tweet' in tw_obj:
      text = tw_obj['extended_tweet']['full_text']
    # or use normal text
    else:
      text = tw_obj['text']
    
    # process quoted tweet and append to text
    if tw_obj['is_quote_status'] and 'quoted_status' in tw_obj:
      # process quoted tweet
      qt_obj = tw_obj['quoted_status']
      if 'extended_tweet' in qt_obj:
        qt_text = qt_obj['extended_tweet']['full_text']
      # or use normal text
      else:
        qt_text = qt_obj['text']
      text = ''.join([text, ' %QUOTES% ', qt_text])

    text_norm = normalizeTextForTagger(replace_sp_tokens(text))
    # process text into list of keywords
    text_tokens = get_tokens(text)
    text_tokens = [t for t in text_tokens if t not in stopwords]
    token_counts = dict(Counter(itertools.chain(*[text_tokens])))
    # text_tokens = [lemma(t) for t in text_tokens]
    
    return text, text_norm, text_tokens, token_counts
      
  def parse_time(tw_obj):
    # parse timestamp to needed format
    # we need an actual timestamp in utc
    # and a fake local timestamp in utc
    # get timezone info
    point = tw_obj['coordinates']['coordinates']
    try:
      tz_name = tzfinder.timezone_at(lng=point[0], lat=point[1])
      tz_info = timezone(tz_name)
    except Exception as e:
      # if there is error when converting timezone
      # give default timezone as: US/Central
      tz_name = 'US/Central'
      tz_info = timezone(tz_name)
    # parse the utc timestamp
    time_obj = datetime.strptime(tw_obj['created_at'], time_format)
    # convert to local timestamp
    local_time_obj = time_obj.astimezone(tz_info)
    # get local hour mark for "time-of-day" query
    hour_mark = local_time_obj.time().hour
    # make a fake local timestamp with UTC timezone
    fake_time_obj = utc.localize(local_time_obj.replace(tzinfo=None))
    return time_obj, local_time_obj, fake_time_obj, hour_mark, tz_name

  def parse_category(tw_obj):
    # parse category into str
    return 'Positive'
    # label = int(row['label'])
    # if label == 1:
    #   return 'Positive'
    # else:
    #   return 'Negative'

  def parse_drug_category(text_norm):
    cats = {}
    for cat in drug_category:
      for t in drug_category[cat]:
        if t in text_norm:
          if cat in cats:
            cats[cat].append(t)
          else:
            cats[cat] = [t]
    return cats

  result_dict = {}
  time_obj, local_time_obj, fake_time_obj, hour_mark, tz_name = parse_time(tweet_obj)
  try:
    text, text_norm, text_tokens, token_counts = parse_text(tweet_obj)
  except:
    print(tweet_obj)
    return None
  # put up dict
  result_dict['tweetID'] = tweet_obj['id_str']
  result_dict['utcTime'] = time_obj
  # actual local time is not neede since db always saves utc
  # result_dict['localTime'] = local_time_obj
  result_dict['fakeLocalTime'] = fake_time_obj
  # result_dict['hourMark'] = hour_mark
  result_dict['timezone'] = tz_name
  result_dict['Followers'] = tweet_obj['user']['followers_count']
  result_dict['Friends'] = tweet_obj['user']['friends_count']
  result_dict['Statuses'] = tweet_obj['user']['statuses_count']
  result_dict['textRaw'] = text
  result_dict['textNorm'] = text_norm
  result_dict['textTokens'] = text_tokens
  result_dict['textTokenCounts'] = token_counts
  result_dict['drugCategory'] = parse_drug_category(text_norm)
  result_dict['geo'] = tweet_obj['coordinates']
  result_dict['geometry'] = Point(tweet_obj['coordinates']['coordinates'])
  result_dict['category'] = parse_category(tweet_obj)
  return result_dict

def build_gdf_from_processed_tweets(tweet_json, main_crs):
  # process tweets
  result_dict_list = []
  for tw_obj in tweet_json:
    td = parse_fields_2017_coord(tw_obj)
    if td is not None:
      result_dict_list.append(td)
  # turn into gdf
  df = pd.DataFrame.from_records(result_dict_list)
  tweet_gdf = gpd.GeoDataFrame(df, crs=main_crs)
  return tweet_gdf
  
def worker_prepare_records_positive_tweets(main_crs, pop_gdf, in_q, record_q, m_q):
  while True:
    # get path from queue
    tweet_path = in_q.get()
    m_q.put('Path {}, time {}'.format(tweet_path, datetime.now()))
    if tweet_path is None:
      m_q.put('Input finished, time {}'.format(datetime.now()))
      record_q.put(None)
      break
    # read json file
    m_q.put('reading file, time {}'.format(datetime.now()))
    tweet_json = load_tweets_from_json(tweet_path)
    # process tweet objs
    m_q.put('processing tweets, time {}'.format(datetime.now()))
    tweet_gdf = build_gdf_from_processed_tweets(tweet_json, main_crs)
    # do spatial join
    m_q.put('doing sjoin, time {}'.format(datetime.now()))
    joined_gdf = join_tweets_pop_gdf(pop_gdf, tweet_gdf)
    # output
    record_q.put(joined_gdf)
    m_q.put('One file processed, time {}'.format(datetime.now()))

def worker_insert_tweets_2017(record_queue, m_q, num_workers):
  table = connect_to_db('drug_viz_data', 'tweets_2017_filter')
  none_count = 0
  while True:
    joined_gdf = record_queue.get()
    if joined_gdf is None:
      none_count += 1
      if none_count >= num_workers:
        m_q.put('Records finished, time {}'.format(datetime.now()))
        m_q.put(None)
        break
      continue
    # process fields
    joined_gdf = joined_gdf.rename({'POP100':'Pop_2010', 
                                  'GEOID':'GeoID_2010', 
                                  'TRACT':'TractID_2010',
                                  'STATE':'StateID',
                                  'COUNTY':'CountyID_2010'}, axis='columns')
    joined_gdf = joined_gdf[['Followers', 'Friends','Statuses',
                            'category','drugCategory','fakeLocalTime',
                            'geo','textNorm','textRaw','textTokenCounts',
                            'textTokens','timezone','tweetID','utcTime',
                            'Pop_2010','GeoID_2010','TractID_2010',
                            'StateID','CountyID_2010']]
    # turn gdf to list of dicts
    tweet_dicts = joined_gdf.to_dict('records')
    # insert
    m_q.put('Inserting, time {}, size {}'.format(datetime.now(), len(tweet_dicts)))
    table.insert_many(tweet_dicts)

def process_records_mp():
  # load shpfiles
  all_gdf, main_crs = load_shpfiles()
  # load census data
  all_census_df = load_census_concat()
  # join shpfiles and census data
  pop_gdf = join_census_shpfile(all_gdf, all_census_df)
  # setup process and queues
  manager = Manager()
  in_q = manager.Queue(20)
  record_q = manager.Queue(3)
  m_q = manager.Queue(1000)
  num_workers = 2
  # start processes
  process_pool = []
  for i in range(num_workers):
    process_p = Process(target=worker_prepare_records_positive_tweets, args=(main_crs, pop_gdf, in_q, record_q, m_q))
    process_p.start()
    process_pool.append(process_p)
  out_p = Process(target=worker_insert_tweets_2017, args=(record_q, m_q, num_workers))
  out_p.start()
  # put file path into queue
  # change this path
  path_temp = 'D:/TEMPFILE/2017_filter/2017_positive_filtered_tweets_{}.json'
  for i in range(2):
    p = path_temp.format(i)
    in_q.put(p)
  for i in range(num_workers):
    in_q.put(None)
  print('all in')
  # wait till finish
  while True:
    m = m_q.get()
    if m is None:
      print('all done')
      break
    print(m)
  # make index
  table = connect_to_db('drug_viz_data', 'tweets_2017_filter')
  table.create_index([('textNorm',pymongo.TEXT)])
  table.create_index([('geo',pymongo.GEOSPHERE)])
  table.create_index("utcTime")
  table.create_index("fakeLocalTime")
  table.create_index("textTokens")
  table.create_index("category")
  table.create_index("drugCategory")
  table.create_index("StateID")
  table.create_index("GeoID_2010")
  table.create_index("Pop_2010")
  # done
  for p in process_pool:
    p.join()
  out_p.join()
  print('all process ends')
  return

def test():
  # load shpfiles
  all_gdf, main_crs = load_shpfiles()
  # load census data
  all_census_df = load_census_concat()
  # join shpfiles and census data
  pop_gdf = join_census_shpfile(all_gdf, all_census_df)

  path = 'D:/TEMPFILE/tweets/2017_positive_tweets_0.json'
  tweet_json = load_tweets_from_json(path)
  # process tweet objs
  tweet_gdf = build_gdf_from_processed_tweets(tweet_json, main_crs)
  # do spatial join
  joined_gdf = join_tweets_pop_gdf(pop_gdf, tweet_gdf)

  print(joined_gdf.head().to_string())
  print(joined_gdf.columns)

  joined_gdf = joined_gdf.rename({'POP100':'Pop_2010', 
                                  'GEOID':'GeoID_2010', 
                                  'TRACT':'TractID_2010',
                                  'STATE':'StateID',
                                  'COUNTY':'CountyID_2010'}, axis='columns')
  joined_gdf = joined_gdf[['Followers', 'Friends','Statuses',
                            'category','drugCategory','fakeLocalTime',
                            'geo','textNorm','textRaw','textTokenCounts',
                            'textTokens','timezone','tweetID','utcTime',
                            'Pop_2010','GeoID_2010','TractID_2010',
                            'StateID','CountyID_2010']]
  print(joined_gdf.head().to_string())
  print(joined_gdf.columns)
  

if __name__ == '__main__':
  process_records_mp()
  exit()
