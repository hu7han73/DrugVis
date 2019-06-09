# DrugVis
# By: Han Hu (hh255@njit.edu; https://github.com/hu7han73)
# License: BSD

import pandas as pd
import geopandas as gpd
from shapely.geometry import Point
import fiona
import geojson
import json
from datetime import datetime, timedelta
import math

stopwords = set(['i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'ought', 'im', "i'm", 'youre', "you're", 'hes', "he's", 'shes', "she's", 'its', "it's", 'were', "we're", 'theyre', "they're", 'ive', "i've", 'youve', "you've", 'weve', "we've", 'theyve', "they've", 'id', "i'd", 'youd', "you'd", "he'd", "she'd", "we'd", 'theyd', "they'd", 'ill', "i'll", 'youll', "you'll", "he'll", "she'll", "we'll", 'theyll', "they'll", 'isnt', "isn't", 'arent', "aren't", 'wasnt', "wasn't", 'werent', "weren't", 'hasnt', "hasn't", 'havent', "haven't", 'hadnt', "hadn't", 'doesnt', "doesn't", 'dont', "don't", 'didnt', "didn't", 'wont', "won't", 'wouldnt', "wouldn't", 'shant', "shan't", 'shouldnt', "shouldn't", 'cant', "can't", 'cannot', 'couldnt', "couldn't", 'mustnt', "mustn't", 'lets', "let's", 'thats', "that's", 'whos', "who's", 'whats', "what's", 'heres', "here's", 'theres', "there's", 'whens', "when's", 'wheres', "where's", 'whys',
"why's", 'hows', "how's", 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'as', 'of', 'at', 'by', 'for', 'with', 'about', 'to', 'from', 'then', 'some', 'such', 'nor', 'so', 'than', '%url%','%user_mention%','%quotes%'])

def get_state_fips_dict():
  state_fips_str = '''Alabama 	AL 	01
  Alaska 	AK 	02
  Arizona 	AZ 	04
  Arkansas 	AR 	05
  California 	CA 	06
  Colorado 	CO 	08
  Connecticut 	CT 	09
  Delaware 	DE 	10
  District of Columbia  DC  11
  Florida 	FL 	12
  Georgia 	GA 	13
  Hawaii 	HI 	15
  Idaho 	ID 	16
  Illinois 	IL 	17
  Indiana 	IN 	18
  Iowa 	IA 	19
  Kansas 	KS 	20
  Kentucky 	KY 	21
  Louisiana 	LA 	22
  Maine 	ME 	23
  Maryland 	MD 	24
  Massachusetts 	MA 	25
  Michigan 	MI 	26
  Minnesota 	MN 	27
  Mississippi 	MS 	28
  Missouri 	MO 	29
  Montana 	MT 	30
  Nebraska 	NE 	31
  Nevada 	NV 	32
  New Hampshire 	NH 	33
  New Jersey 	NJ 	34
  New Mexico 	NM 	35
  New York 	NY 	36
  North Carolina 	NC 	37
  North Dakota 	ND 	38
  Ohio 	OH 	39
  Oklahoma 	OK 	40
  Oregon 	OR 	41
  Pennsylvania 	PA 	42
  Rhode Island 	RI 	44
  South Carolina 	SC 	45
  South Dakota 	SD 	46
  Tennessee 	TN 	47
  Texas 	TX 	48
  Utah 	UT 	49
  Vermont 	VT 	50
  Virginia 	VA 	51
  Washington 	WA 	53
  West Virginia 	WV 	54
  Wisconsin 	WI 	55
  Wyoming 	WY 	56
  American Samoa 	AS 	60
  Guam 	GU 	66
  Northern Mariana Islands 	MP 	69
  Puerto Rico 	PR 	72
  Virgin Islands 	VI 	78'''
  states_str = state_fips_str.split('\n')
  state_fips_dict = {}
  for state_str in states_str:
    s = state_str.split()
    # print(s)
    state = ' '.join(s[:-2])
    # print(state)
    abbr = s[-2]
    fips = s[-1]
    if state not in ['Hawaii','Alaska','American Samoa','Guam','Northern Mariana Islands','Puerto Rico','Virgin Islands']:
      state_fips_dict[state] = fips
  return state_fips_dict

def get_states():
  state_fips_str = '''Alabama 	AL 	01
  Alaska 	AK 	02
  Arizona 	AZ 	04
  Arkansas 	AR 	05
  California 	CA 	06
  Colorado 	CO 	08
  Connecticut 	CT 	09
  Delaware 	DE 	10
  District of Columbia  DC  11
  Florida 	FL 	12
  Georgia 	GA 	13
  Hawaii 	HI 	15
  Idaho 	ID 	16
  Illinois 	IL 	17
  Indiana 	IN 	18
  Iowa 	IA 	19
  Kansas 	KS 	20
  Kentucky 	KY 	21
  Louisiana 	LA 	22
  Maine 	ME 	23
  Maryland 	MD 	24
  Massachusetts 	MA 	25
  Michigan 	MI 	26
  Minnesota 	MN 	27
  Mississippi 	MS 	28
  Missouri 	MO 	29
  Montana 	MT 	30
  Nebraska 	NE 	31
  Nevada 	NV 	32
  New Hampshire 	NH 	33
  New Jersey 	NJ 	34
  New Mexico 	NM 	35
  New York 	NY 	36
  North Carolina 	NC 	37
  North Dakota 	ND 	38
  Ohio 	OH 	39
  Oklahoma 	OK 	40
  Oregon 	OR 	41
  Pennsylvania 	PA 	42
  Rhode Island 	RI 	44
  South Carolina 	SC 	45
  South Dakota 	SD 	46
  Tennessee 	TN 	47
  Texas 	TX 	48
  Utah 	UT 	49
  Vermont 	VT 	50
  Virginia 	VA 	51
  Washington 	WA 	53
  West Virginia 	WV 	54
  Wisconsin 	WI 	55
  Wyoming 	WY 	56
  American Samoa 	AS 	60
  Guam 	GU 	66
  Northern Mariana Islands 	MP 	69
  Puerto Rico 	PR 	72
  Virgin Islands 	VI 	78'''
  state_list = []
  for state_str in state_fips_str.split('\n'):
    s = state_str.split()
    # print(s)
    state = ' '.join(s[:-2])
    # print(state)
    if state not in ['Hawaii','Alaska','American Samoa','Guam','Northern Mariana Islands','Puerto Rico','Virgin Islands']:
      state_list.append(state)
  return state_list

def concat_gdf(gdf_list):
  _crs = gdf_list[0].crs
  return gpd.GeoDataFrame(pd.concat(gdf_list), crs=_crs)

def load_shpfile(path):
  # print('loading shapefiles')
  # print(path)
  with open(path, 'rb') as inf:
    direct = inf.read()
  with fiona.BytesCollection(direct) as f:
    crs = f.crs
    ct_gdf = gpd.GeoDataFrame.from_features(f, crs=crs)
    # print("Shape of the ct_gdf: {}".format(ct_gdf.shape))
    # print("Projection of ct_gdf: {}".format(ct_gdf.crs))
    ct_gdf = ct_gdf.to_crs({'init': 'epsg:4326'})
    # print("Projection of ct_gdf: {}".format(ct_gdf.crs))
  return ct_gdf

def load_shpfiles(states, state_dict, base_path):
  def clip_geoid(x):
    return x[9:]
  # read shapefiles as geodataframes
  main_crs = None
  gdf_list = []
  for s in states:
    fips = state_dict[s]
    path = base_path.format(fips)
    with open(path, 'rb') as inf:
      direct = inf.read()
    with fiona.BytesCollection(direct) as f:
      crs = f.crs
      ct_gdf = gpd.GeoDataFrame.from_features(f, crs=crs)
      ct_gdf = ct_gdf.to_crs({'init': 'epsg:4326'})
      if not main_crs:
        main_crs = ct_gdf.crs
      gdf_list.append(ct_gdf)
  # concat all geodataframes
  all_gdf = gpd.GeoDataFrame(pd.concat(gdf_list, ignore_index=True), crs=main_crs)
  all_gdf['GEOID'] = all_gdf['GEO_ID'].apply(clip_geoid)
  return all_gdf, main_crs

def min_max(s, min, max):
  return (s-min)/(max-min)

def clip_geoid(x):
  return x[9:]

def list_year(start, end):
  return [str(y) for y in range(int(start[0:4]), int(end[0:4])+1)]

def list_month(start, end):
  start_time = datetime.strptime(start, "%Y-%m-%d")
  end_time = datetime.strptime(end, "%Y-%m-%d")
  total_months = lambda dt: dt.month + 12 * dt.year
  mlist = []
  for tot_m in range(total_months(start_time)-1, total_months(end_time)):
      y, m = divmod(tot_m, 12)
      mlist.append(datetime(y, m+1, 1).strftime("%b-%y"))
  return mlist

def list_month_repeat(start, end):
  start_time = datetime.strptime(start, "%Y-%m-%d")
  end_time = datetime.strptime(end, "%Y-%m-%d")
  total_months = lambda dt: dt.month + 12 * dt.year
  mlist = []
  for tot_m in range(total_months(start_time)-1, total_months(end_time)):
      y, m = divmod(tot_m, 12)
      month = datetime(y, m+1, 1).strftime("%b")
      if month not in mlist:
        mlist.append(month)
  return mlist

def daterange(start_date, end_date):
  for n in range(int ((end_date - start_date).days)):
    yield start_date + timedelta(days=n)

def list_dates(start, end):
  start_time = datetime.strptime(start, "%Y-%m-%d")
  end_time = datetime.strptime(end, "%Y-%m-%d")
  return [d.strftime('%m-%d-%y') for d in daterange(start_time, end_time)]

def weekrange(start_date, end_date):
  for n in range(math.ceil((end_date - start_date).days / 7)):
    yield start_date + timedelta(weeks=n)

def list_weeks(start, end):
  start_time = datetime.strptime(start, "%Y-%m-%d")
  end_time = datetime.strptime(end, "%Y-%m-%d")
  return [w.strftime('W%U-%y') for w in weekrange(start_time, end_time)]

def list_weekdays(start, end):
  start_time = datetime.strptime(start, "%Y-%m-%d")
  end_time = datetime.strptime(end, "%Y-%m-%d")
  wdlist = []
  for d in daterange(start_time, end_time):
    wdlist.append(d.strftime('%a'))
    if len(wdlist) >= 7:
      break
  return wdlist

def test():
  begin = '2017-02-03'
  end = '2017-07-08'
  print(list_year(begin, end))
  print(list_month(begin, end))
  print(list_dates(begin, end))
  print(list_weeks(begin, end))
  print(list_weekdays(begin, end))


if __name__ == '__main__':
  test()