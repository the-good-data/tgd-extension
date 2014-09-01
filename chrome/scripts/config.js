/*

  Copyright 2014 The Good Data Cooperative Ltd. / 
  Copyright 2010-2014 Disconnect, Inc.

  This program is free software, excluding the brand features and third-party 
  portions of the program identified in the “Exceptions” below: you can redis-
  tribute it and/or modify it under the terms of the GNU General Public License 
  as published by the Free Software Foundation, either version 3 of the License, 
  or (at your option) any later version.

  This program is distributed in the hope that it will be useful, but WITHOUT 
  ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS 
  FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

  You should have received a copy of the GNU General Public License along with 
  this program.  If not, see <http://www.gnu.org/licenses/>.

  Authors (one per line):
  
*/

/**
 * To change constants for development version:
 * 
 * 1. Please go to options.html page.
 * 2. Add a new item to the env select box, example: dev7
 * 3. Get back here and add a new case inside the switch for the constants you need to change
 */

// set extension environment
const TGD_ENV=getLocalOption("TGD_ENV", "prod");

const C_MN = "d2hhdGlmaWRpZHRoaXMx";
const SALT = "";

// set api url ----------------------------------------------------------------
switch (TGD_ENV) {
  case "dev1": {
      const TGD_API = "http://tgd.heavydots.com/";
      break;
  }
  case "dev2": {
      const TGD_API = "http://www.tgd.local/";
      break;
  }
  default: {
      const TGD_API = "https://www.thegooddata.org/";
  }
}

// set website url -------------------------------------------------------------
switch (TGD_ENV) {
  case "dev1": {
      const URL = "http://tgd.heavydots.com/";
      break;
  }
  case "dev1": {
      const URL = "http://www.tgd.local/";
      break;
  }
  default: {
      const URL = "https://www.thegooddata.org/";
  }
}

// set extension lang
const LANG = '_'+'en';

var log_categories={
    adtrack: false,
    query: false,
    browsing: false
};

// set main debug --------------------------------------------------------------
switch (TGD_ENV) {
  case "dev1":
  case "dev2": {
      const DEBUG = true;
      log_categories.adtrack=false;
      log_categories.query=false;
      log_categories.browsing=true;
      break;
  }
  default: {
      const DEBUG = false;
  }
}

// other debug
const DEBUG_ADTRACK = false;
const DEBUG_BROWSING = false;
const DEBUG_QUERY = false;
const DEBUG_QUERY_BLACKLIST = false;
const DEBUG_WHITELIST = false;
const DEBUG_CREDENTIAL= false;
const DEBUG_ARCHIVEMENTS= false;
const DEBUG_LOANS = false;
const DEBUG_QUERY_CHECK = false;
const DEBUG_QUERIES_COUNT = false;
const DEBUG_QUERIES_PERCENTILE = false;
const DEBUG_LANGUAGES_SUPPORT_CHECK = false;
const DEBUG_DELETE_QUERIES = false;

// log some information to know on what environment we're running
console.log("Running TGD - ENV: "+localStorage.TGD_ENV);
console.log("TGD API: "+TGD_API);

// function used to get options from local storage
function getLocalOption(key, defaultValue) {
  if (localStorage[key] != undefined) {
    return localStorage[key];
  }
  return defaultValue;
}