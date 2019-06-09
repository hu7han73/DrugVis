# DrugVis
# By: Han Hu (hh255@njit.edu; https://github.com/hu7han73)
# License: BSD

import requests
import time

from utils import get_state_fips_list

def download_shpfiles():
  state_fips_list = get_state_fips_list()
  # url_base = 'https://www2.census.gov/geo/tiger/GENZ2010/'
  # home_path = '../shpfiles/census_tracts_simple/'
  # filename_temp = 'gz_2010_{}_140_00_500k.zip'
  url_base = 'http://censusdata.ire.org/'
  home_path = '../data/census_2010/'
  filename_temp = '{}/all_140_in_{}.P12.csv'
  local_filename_temp = 'all_140_in_{}.P12.csv'
  for fp in state_fips_list:
    time.sleep(0.5)
    # url = url_base + filename_temp.format(fp)
    url = url_base + filename_temp.format(fp, fp)
    print('getting {}'.format(url))
    r = requests.get(url)
    if str(r.status_code) == '200':
      with open(home_path + local_filename_temp.format(fp), 'wb') as outf:
        outf.write(r.content)
        print('done')
    else:
      raise FileNotFoundError('File {} not found'.format(url))
  print('all_done')

download_shpfiles()
exit()