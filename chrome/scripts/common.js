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

function contains(a, obj) {
    for (var i = 0; i < a.length; i++) {
        if (a[i] === obj) {
            return true;
        }
    }
    return false;
}

/*
 * Date Format 1.2.3
 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
 * MIT license
 *
 * Includes enhancements by Scott Trenda <scott.trenda.net>
 * and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 */

var dateFormat = function () {
  var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
    timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
    timezoneClip = /[^-+\dA-Z]/g,
    pad = function (val, len) {
      val = String(val);
      len = len || 2;
      while (val.length < len) val = "0" + val;
      return val;
    };

  // Regexes and supporting functions are cached through closure
  return function (date, mask, utc) {
    var dF = dateFormat;

    // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
    if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
      mask = date;
      date = undefined;
    }

    // Passing date through Date applies Date.parse, if necessary
    date = date ? new Date(date) : new Date;
    if (isNaN(date)) throw SyntaxError("invalid date");

    mask = String(dF.masks[mask] || mask || dF.masks["default"]);

    // Allow setting the utc argument via the mask
    if (mask.slice(0, 4) == "UTC:") {
      mask = mask.slice(4);
      utc = true;
    }

    var _ = utc ? "getUTC" : "get",
      d = date[_ + "Date"](),
      D = date[_ + "Day"](),
      m = date[_ + "Month"](),
      y = date[_ + "FullYear"](),
      H = date[_ + "Hours"](),
      M = date[_ + "Minutes"](),
      s = date[_ + "Seconds"](),
      L = date[_ + "Milliseconds"](),
      o = utc ? 0 : date.getTimezoneOffset(),
      flags = {
        d:    d,
        dd:   pad(d),
        ddd:  dF.i18n.dayNames[D],
        dddd: dF.i18n.dayNames[D + 7],
        m:    m + 1,
        mm:   pad(m + 1),
        mmm:  dF.i18n.monthNames[m],
        mmmm: dF.i18n.monthNames[m + 12],
        yy:   String(y).slice(2),
        yyyy: y,
        h:    H % 12 || 12,
        hh:   pad(H % 12 || 12),
        H:    H,
        HH:   pad(H),
        M:    M,
        MM:   pad(M),
        s:    s,
        ss:   pad(s),
        l:    pad(L, 3),
        L:    pad(L > 99 ? Math.round(L / 10) : L),
        t:    H < 12 ? "a"  : "p",
        tt:   H < 12 ? "am" : "pm",
        T:    H < 12 ? "A"  : "P",
        TT:   H < 12 ? "AM" : "PM",
        Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
        o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
        S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
      };

    return mask.replace(token, function ($0) {
      return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
    });
  };
}();

// Some common format strings
dateFormat.masks = {
  "default":      "ddd mmm dd yyyy HH:MM:ss",
  shortDate:      "m/d/yy",
  mediumDate:     "mmm d, yyyy",
  longDate:       "mmmm d, yyyy",
  fullDate:       "dddd, mmmm d, yyyy",
  shortTime:      "h:MM TT",
  mediumTime:     "h:MM:ss TT",
  longTime:       "h:MM:ss TT Z",
  isoDate:        "yyyy-mm-dd",
  isoTime:        "HH:MM:ss",
  isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
  isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};

// Internationalization strings
dateFormat.i18n = {
  dayNames: [
    "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
  ],
  monthNames: [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
  ]
};

// For convenience...
Date.prototype.format = function (mask, utc) {
  return dateFormat(this, mask, utc);
};
/* Generate a Hashtable  */
function Hash()
{
    this.length = 0;
    this.items = new Array();
    for (var i = 0; i < arguments.length; i += 2) {
        if (typeof(arguments[i + 1]) != 'undefined') {
            this.items[arguments[i]] = arguments[i + 1];
            this.length++;
        }
    }

    this.removeItem = function(in_key)
    {
        var tmp_value;
        if (typeof(this.items[in_key]) != 'undefined') {
            this.length--;
            var tmp_value = this.items[in_key];
            delete this.items[in_key];
        }
        return tmp_value;
    }

    this.getItem = function(in_key) {
        return this.items[in_key];
    }

    this.setItem = function(in_key, in_value)
    {
        if (typeof(in_value) != 'undefined') {
            if (typeof(this.items[in_key]) == 'undefined') {
                this.length++;
            }

            this.items[in_key] = in_value;
        }
        return in_value;
    }

    this.hasItem = function(in_key)
    {
        return typeof(this.items[in_key]) != 'undefined';
    }
}

function getDomainName(data)
{
  var    a      = document.createElement('a');
         a.href = data;
  return a.hostname;
}

// Reset entire whitelist
function resetEntireWhitelist(){
  var WHITELIST = {};
  var SITE_WHITELIST = {};
  localStorage.whitelist = JSON.stringify(WHITELIST);
}

//Add services to whitelist
function addWhitelist(DOMAIN,service_name, category, status){
  var WHITELIST = deserialize(localStorage.whitelist) || {};
  var SITE_WHITELIST = WHITELIST[DOMAIN] || (WHITELIST[DOMAIN] = {});

  WHITELIST[DOMAIN][service_name+':'+category]=!status;
  localStorage.whitelist = JSON.stringify(WHITELIST);
}

//Get status whitelisted service
function getWhitelistStatus(DOMAIN,tab,service_name,category){
  var WHITELIST = deserialize(localStorage.whitelist) || {};
  var SITE_WHITELIST = WHITELIST[DOMAIN] || (WHITELIST[DOMAIN] = {});
  
  if (SITE_WHITELIST[service_name+':'+category]==undefined)
  {
    return false;
  }
  else
  {
    return SITE_WHITELIST[service_name+':'+category];
  }
}

//Set status whitelisted service
function setWhitelistStatus(DOMAIN,tab,service_name,category,status){
  var WHITELIST = deserialize(localStorage.whitelist) || {};
  var SITE_WHITELIST = WHITELIST[DOMAIN] || (WHITELIST[DOMAIN] = {});
  
  SITE_WHITELIST[service_name+':'+category]=status;
  localStorage.whitelist = JSON.stringify(WHITELIST);

}

//Cast string to boolean values
function castBool(str) {
    if (str != undefined && str.toLowerCase() === 'true') {
        return true;
    } else if (str != undefined && str.toLowerCase() === 'false') {
        return false;
    }
    return false;
}

//Get value if actual tab is deactivate 
function isDeactivateCurrent(DOMAIN,ID){

  var status=false;
  //return true;
  var WHITELIST = deserialize(localStorage.whitelist) || {};
  var SITE_WHITELIST = WHITELIST[DOMAIN] || (WHITELIST[DOMAIN] = {});

  //Render Adtracks in GUI
  try
  {
    for (i in SITE_WHITELIST) 
    {
      if (i == '*' || i == '*:*') // Added *:* because whitelist now works with service_name:category
      {
        status = SITE_WHITELIST[i];
      }
    }
  }
  catch(err)
  {
    console.log(err);
  }

  return status;
}

/* Generate a user_id for anSaveHistoryonymous user. */
function createUUID() {
    // http://www.ietf.org/rfc/rfc4122.txt
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = "-";

    var uuid = s.join("");
    return uuid;
}

/* Populates an array of a given length with a default value. */
function initializeArray(length, defaultValue) {
  var ARRAY = [];
  for (var i = 0; i < length; i++) ARRAY[i] = defaultValue;
  return ARRAY;
}

/* Destringifies an object. */
function deserialize(object) {
  return typeof object == 'string' ? JSON.parse(object) : object;
}

/* Rewrites a generic cookie with specific domains and paths. */
function mapCookie(cookie, storeId, url, domain, subdomains, paths) {
  var MINIMIZE = Math.min;
  var SUBDOMAIN_COUNT = MINIMIZE(subdomains.length, 20);
      // Chrome won't persist more than 22 domains because of cookie limits.
  delete cookie.hostOnly;
  delete cookie.session;
  var DOMAIN = cookie.domain;

  for (var i = 0; i < SUBDOMAIN_COUNT; i++) {
    var subdomain = subdomains[i];
    cookie.url = url.replace('www', subdomain).replace('search', subdomain);
    cookie.domain = subdomain + domain;
    COOKIES.set(cookie);
  }

  var PATH_COUNT = MINIMIZE(paths.length, 10);
      // Chrome won't persist more than 11 paths.
  cookie.domain = DOMAIN;

  for (i = 0; i < PATH_COUNT; i++) {
    var path = paths[i];
    cookie.url = url + path;
    cookie.path = '/' + path;
    COOKIES.set(cookie);
  }

  COOKIES.remove({url: url, name: cookie.name, storeId: storeId});
}

/* Rewrites a batch of generic cookies with specific domains and paths. */
function mapCookies(url, service) {
  COOKIES.getAllCookieStores(function(cookieStores) {
    var STORE_COUNT = cookieStores.length;
    var DOMAIN = '.' + service[1][0];
    var SUBDOMAINS = service[2];
    var PATHS = service[3];

    for (var i = 0; i < STORE_COUNT; i++) {
      var storeId = cookieStores[i].id;

      COOKIES.getAll({url: url, storeId: storeId}, function(cookies) {
        var COOKIE_COUNT = cookies.length;
        for (var j = 0; j < COOKIE_COUNT; j++)
            mapCookie(cookies[j], storeId, url, DOMAIN, SUBDOMAINS, PATHS);
      });
    }
  });
}

/* Erases a batch of cookies. */
function deleteCookies(url, domain, path, storeId, name) {
  var DETAILS = {url: url, storeId: storeId};
  if (name) DETAILS.name = name;

  COOKIES.getAll(DETAILS, function(cookies) {
    var COOKIE_COUNT = cookies.length;

    for (var i = 0; i < COOKIE_COUNT; i++) {
      var cookie = cookies[i];
      if (cookie.domain == domain && cookie.path == path)
          COOKIES.remove(
            {url: url, name: name || cookie.name, storeId: storeId}
          );
    }
  });
}

/* Rewrites a batch of specific cookies with a generic domain and path. */
function reduceCookies(url, service, name) {
  COOKIES.getAllCookieStores(function(cookieStores) {
    var STORE_COUNT = cookieStores.length;
    var SUBDOMAINS = service[2];
    var SUBDOMAIN_COUNT = SUBDOMAINS.length;
    var DOMAIN = '.' + service[1][0];
    var PATHS = service[3];
    var PATH_COUNT = PATHS.length;

    for (var i = 0; i < STORE_COUNT; i++) {
      var storeId = cookieStores[i].id;

      for (var j = 0; j < SUBDOMAIN_COUNT; j++) {
        var subdomain = SUBDOMAINS[j];
        var mappedUrl =
            url.replace('www', subdomain).replace('search', subdomain);

        if (!name && !j) {
          COOKIES.getAll({url: mappedUrl, storeId: storeId}, function(cookies) {
            var COOKIE_COUNT = cookies.length;

            for (var i = 0; i < COOKIE_COUNT; i++) {
              var details = cookies[i];
              details.url = url;
              details.domain = DOMAIN;
              delete details.hostOnly;
              delete details.session;

              setTimeout(function(details) {
                COOKIES.set(details);
              }.bind(null, details), 1000);
            }
          });
        }

        deleteCookies(mappedUrl, '.' + subdomain + DOMAIN, '/', storeId, name);
      }

      for (j = 0; j < PATH_COUNT; j++) {
        var path = PATHS[j];
        deleteCookies(url + path, DOMAIN, '/' + path, storeId, name);
      }
    }
  });
}




/**
 * Class to manage local javascript cache to local storage.
 */
var jsCache = new function () {
  
  // json object where to store data
  this._data={};
  
  this.get = function (key, defaultValue) {
    this.log('getting key:'+key);
    if (typeof (this._data[key]) !== 'undefined') {
      var item=this._data[key];
      if (item.expire===0 || item.expire > this.time()) {
        this.log('got value:');
        this.log(item.value);
        return item.value;
      } else {
        this.log('remove expired item: '+key);
        this.deleteValue(key);
      }
    }
    this.log('no value, returning default:');
    this.log(defaultValue);
    return defaultValue;
  };
  
  this.set = function (key, value, expire) {
    this.log('setting key:'+key);
    this.deleteValue(key);
    this.addValue(key, value, expire);
  };
  
  this.deleteValue = function (key) {
    if (typeof (this._data[key]) !== 'undefined') {
      delete this._data[key];
    }
    this.log('deleting key:'+key);
    this.saveToLocalStorage();
  };
  this.addValue = function (key, value, expire) {
    if (expire > 0) {
      expire += this.time();
    } else {
      expire = 0;
    }
    this._data[key] = {
      'value': value,
      'expire': expire
    };
    this.log('adding key:'+key+' expire:'+expire);
    this.log('value:');
    this.log(value);
    this.saveToLocalStorage();
  };
  this.time = function () {
    var ts = Math.round((new Date()).getTime() / 1000);
    return ts;
  };
  this.deserialize = function (object) {
    return typeof object === 'string' ? JSON.parse(object) : object;
  };
  this.stringify=function (value) {
    return JSON.stringify(value);
  };
  this.restoreFromLocalStorage = function () {
    this.log('restoring localStorage.jsCache');
    if (typeof(localStorage.jsCache)!=='undefined') {
      this._data=this.deserialize(localStorage.jsCache);
      this.log(localStorage.jsCache);
      this.log(this._data);
    } else {
      this.log('localStorage.jsCache is empty');
    }
  };
  this.saveToLocalStorage = function () {
    localStorage.jsCache=this.stringify(this._data);
    this.log("updating local storage");
    this.log(this._data);
    this.log(localStorage.jsCache);
  };
  this.log = function (msg) {
    log_if_enabled(msg,'jsCache');
  };
};
// restoring from local cache
jsCache.restoreFromLocalStorage();



function CheckLanguagesSupport(lang,callback){
  
  // check if we've got cached this language support to avoid making request
  var languagesSupport_cache_key='languagesSupport_'+lang;
  var languagesSupport=jsCache.get(languagesSupport_cache_key, null);
  
  if (languagesSupport !== null) {
    callback(languagesSupport);
    return; 
  }
  
  // not cached, make request
  var xhr = new XMLHttpRequest();

  xhr.open('GET', TGD_API+"api/languagesSupport/"+lang, false);
  xhr.onload = function () {
      if (xhr.readyState == 4) {
        
        var resp = JSON.parse(xhr.responseText);

        if (DEBUG && DEBUG_LANGUAGES_SUPPORT_CHECK){
          console.log('QUERY CHECK RECUPERADAS EN EL API');
          console.log('===========================');
          console.log(resp);
          console.log('===========================');
          console.log('');
        }

        if ( xhr.status == 200)  {
          if (DEBUG && DEBUG_LANGUAGES_SUPPORT_CHECK)
            console.log(xhr.responseText);
        }
        else  {
          console.log( "Error: " + xhr.status + ": " + xhr.statusText);
        }

        var resp = JSON.parse(xhr.responseText);
        callback(resp);
        
        // now save results to cache for 1h
        jsCache.set(languagesSupport_cache_key, resp, 3600);
        
      }
  };

  if (DEBUG && DEBUG_LANGUAGES_SUPPORT_CHECK){
    console.log('QUERY CHECK DE LANGUAGESSUPPORT ENVIADA AL API');
    console.log('===========================');
    console.log(lang);
    console.log('===========================');
    console.log('');
  }

  xhr.send();  
}

function CheckQuery(query,alias,callback){

  var xhr = new XMLHttpRequest();

  query = encodeURI(query);
  console.log('----->'+query);

  //query = query.replace("%","");
  xhr.open('GET', TGD_API+"api/queriesblacklist/"+alias+"/"+query, false);
  xhr.onload = function () {
      if (xhr.readyState == 4) {
        
        var resp = JSON.parse(xhr.responseText);

        if (DEBUG && DEBUG_QUERY_CHECK){
          console.log('QUERY CHECK RECUPERADAS EN EL API');
          console.log('===========================');
          console.log(resp);
          console.log('===========================');
          console.log('');
        }

        if ( xhr.status == 200)  {
          if (DEBUG && DEBUG_QUERY_CHECK)
            console.log(xhr.responseText);
        }
        else  {
          console.log( "Error: " + xhr.status + ": " + xhr.statusText);
        }

        var resp = JSON.parse(xhr.responseText);
        callback(resp);
      }
  };

  if (DEBUG && DEBUG_QUERY_CHECK){
    console.log('QUERY CHECK DE LOANS ENVIADA AL API');
    console.log('===========================');
    console.log(query);
    console.log('===========================');
    console.log('');
  }

  xhr.send();
}

function LoadContributed(callback){

  var value='';

  if (localStorage.member_id != 0){
    value=localStorage.member_id;
  }
  else
  {
    value=localStorage.user_id;
  }

  var xhr = new XMLHttpRequest();
  xhr.open('GET', TGD_API+"api/queries/percentile/"+value, true);
  xhr.onload = function () {
      if (xhr.readyState == 4) {
        
        if (DEBUG && DEBUG_QUERIES_PERCENTILE){
          var resp = xhr.responseText;
          console.log('QUERIES PERCENTILE RECUPERADAS EN EL API');
          console.log('===========================');
          console.log(resp);
          console.log('===========================');
          console.log('');
        }

        if ( xhr.status == 200)  {
          if (DEBUG && DEBUG_QUERIES_PERCENTILE)
            console.log(xhr.responseText);
        }
        else  {
          console.log( "Error: " + xhr.status + ": " + xhr.statusText);
        }

        var resp = 0;
        try
        {
          resp=JSON.parse(xhr.responseText);
        }
        catch(e){}

        callback(resp);
      }
  };

  if (DEBUG && DEBUG_QUERIES_PERCENTILE){
    console.log('LISTADO DE QUERIES PERCENTILE ENVIADA AL API');
    console.log('===========================');
    console.log('===========================');
    console.log('');
  }

  xhr.send();
}

function LoadQueries(callback){

  var value='';

  if (localStorage.member_id != 0){
    value=localStorage.member_id;
  }
  else
  {
    value=localStorage.user_id;
  }

  var xhr = new XMLHttpRequest();
  
  xhr.open('GET', TGD_API+"api/queries/count/"+value, true);
  xhr.onload = function () {
      if (xhr.readyState == 4) {

        if (DEBUG && DEBUG_QUERIES_COUNT){
          var resp = xhr.responseText;
          console.log('QUERIES COUNT RECUPERADAS EN EL API');
          console.log('===========================');
          console.log(resp);
          console.log('===========================');
          console.log('');
        }

        if ( xhr.status == 200)  {
          if (DEBUG && DEBUG_QUERIES_COUNT)
            console.log(xhr.responseText);
        }
        else  {
          console.log( "Error: " + xhr.status + ": " + xhr.statusText);
        }

        var resp=0;
        try
        {
          resp = JSON.parse(xhr.responseText);
        }
        catch(e){}
        
        callback(resp);
      }
  };

  if (DEBUG && DEBUG_QUERIES_COUNT){
    console.log('LISTADO DE QUERIES COUNT ENVIADA AL API');
    console.log('===========================');
    console.log('===========================');
    console.log('');
  }

  xhr.send();
}

function LoadLoans(callback){

  var xhr = new XMLHttpRequest();
  xhr.open('GET', TGD_API+"api/loans/count", true);
  xhr.onload = function () {
      if (xhr.readyState == 4) {
        // WARNING! Might be evaluating an evil script!
        
        if (DEBUG && DEBUG_LOANS){
          var resp = JSON.parse(xhr.responseText);
          console.log('LOANS RECUPERADAS EN EL API');
          console.log('===========================');
          console.log(resp);
          console.log('===========================');
          console.log('');
        }

        if ( xhr.status == 200)  {
          if (DEBUG && DEBUG_LOANS)
            console.log(xhr.responseText);
        }
        else  {
          console.log( "Error: " + xhr.status + ": " + xhr.statusText);
        }

        var resp = JSON.parse(xhr.responseText);
        callback(resp);
      }
  };

  if (DEBUG && DEBUG_LOANS){
    console.log('LISTADO DE LOANS ENVIADA AL API');
    console.log('===========================');
    console.log('===========================');
    console.log('');
  }

  xhr.send();
}

// Loads achievements from API and executes a callback
function LoadAchievements(callback) {
  
  // check if we've got it cached
  var achievements=jsCache.get('achievements', null);
  
  if (achievements !== null) {
    log_if_enabled('achievements restored from cache','achievements');
    callback(achievements); 
    return;
  }
  
  var xhr = new XMLHttpRequest();
  xhr.open('GET', TGD_API+"api/achievements", true);
  xhr.onload = function () {
      if (xhr.readyState == 4) {
        // WARNING! Might be evaluating an evil script!
        
          var resp = JSON.parse(xhr.responseText);
          log_if_enabled('ACHIVEMENTS RECUPERADAS EN EL API','achievements');
          log_if_enabled('===========================','achievements');
          log_if_enabled(resp,'achievements');
          log_if_enabled('===========================','achievements');
          log_if_enabled('','achievements');
        

        if ( xhr.status == 200)  {
            log_if_enabled(xhr.responseText,'achievements');
        } else  {
          console.log( "Error: " + xhr.status + ": " + xhr.statusText);
        }
        
        var resp = JSON.parse(xhr.responseText);
        
        // now save results to cache 
        jsCache.set('achievements', resp, 10);
        
        callback(resp);
        
      }
  };

  log_if_enabled('LISTADO DE ACHIVEMENTS ENVIADA AL API','achievements');
  log_if_enabled('===========================','achievements');
  log_if_enabled('===========================','achievements');
  log_if_enabled('','achievements');
  
  xhr.send();
}

// Checks the list of achievements we've got from the API and sets the 
// unreadAchievements variable and updates the extension icon
function checkUnreadAchievements(items) {
  
  var readAchievements = deserialize(localStorage.readAchievements) || [];
  var unreadCount=0;
  
  for (var i = 0; i < items.length; i++) {
    if (readAchievements.indexOf(items[i].id) === -1) {
      unreadCount++;
    }
  }
  
  if (unreadCount) {
    localStorage.hasUnreadAchievements=true;
  } else {
    localStorage.hasUnreadAchievements=false;
  }
  
  // update icon 
  renderExtensionIcon();
}

// Mark a specific achievement as read by its ID and then recheck unread
function markAchievementAsRead(id) {
  var readAchievements = deserialize(localStorage.readAchievements) || [];
  readAchievements.push(id);
  localStorage.readAchievements = JSON.stringify(readAchievements);
  LoadAchievements(checkUnreadAchievements);
}

function SaveBrowsing(browsing){

  var data = new FormData();
  data.append('member_id', browsing.member_id);
  data.append('user_id', browsing.user_id);
  data.append('domain', browsing.domain);
  data.append('url', browsing.url);
  data.append('usertime', browsing.usertime);
  
  var xhr = new XMLHttpRequest();
  xhr.open('POST', TGD_API+"api/browsing", true);
  xhr.onload = function () {
      if (xhr.readyState == 4) {
        // WARNING! Might be evaluating an evil script!
        
        var resp = JSON.parse(xhr.responseText);
        log_if_enabled('BROWSING SALVADA EN EL API','browsing');
        log_if_enabled('===========================','browsing');
        log_if_enabled(resp,'browsing');
        log_if_enabled('===========================','browsing');
        log_if_enabled('','browsing');
        

        if ( xhr.status == 200)  {
            log_if_enabled(xhr.responseText,'browsing');
        }
        else  {
          log_if_enabled( "Error: " + xhr.status + ": " + xhr.statusText,'browsing');
        }
      }
  };

    log_if_enabled('BROWSING ENVIADA AL API','browsing');
    log_if_enabled('===========================','browsing');
    log_if_enabled(data,'browsing');
    log_if_enabled('===========================','browsing');
    log_if_enabled('','browsing');
  

  xhr.send(data);

}

/**
 * Variable where we store temporary local threats
 * @type Array
 */
var localThreats=[];

/**
 * The timeout object
 * @type setTimeout
 */
var apiThreatsBatchWait=null;

/**
 * The time to wait in miliseconds
 * @type Number
 */
var apiThreatsBatchTimeout=10000;

/**
 * Throttle or not the batch, true means every time apiThreatsBatchTimeout 
 * passes then it will be run once while false means it will only run one time.
 * @type Boolean
 */
var apiThreatsBatchThrottle=true;

/**
 * Know if a request to save adtracks is already running
 * @type Boolean
 */
var apiThreatsBatchIsSending=false;

/**
 * How many items to process per request?
 * @type Number
 */
var apiThreatsBatchLimitItems=50;

function SaveThreatsToAPI() {
  
  log_if_enabled('call SaveThreatsToAPI','adtrack_batch');
  
  apiThreatsBatchWait=null;
  
  if (apiThreatsBatchIsSending) {
    log_if_enabled('[SKIPPED]: '+(localThreats.length),'adtrack_batch');
    // if timeout is bigger than 5s and server did not answer yet, drop pending items
    if (apiThreatsBatchTimeout >= 5000) {
      log_if_enabled('[DROP]: '+(localThreats.length)+' items (slow server response)','adtrack_batch');
      localThreats=[]; // drop remaining because server is overloaded
    }
    return;
  }
  
  // Update status
  apiThreatsBatchIsSending=true;
  
  log_if_enabled('[PROCESSING] SaveThreatsToAPI: '+(localThreats.length),'adtrack_batch');
  
  // Init data to send
  var data = {};
  
  // If bigger than items limit per request, just get first group
  if (localThreats.length > apiThreatsBatchLimitItems) {
    log_if_enabled('-------> GET FIRST: '+(localThreats.length),'adtrack_batch');
    // get first apiThreatsBatchLimitItems
    data=localThreats.slice(0, apiThreatsBatchLimitItems);
    // now remove the first group from the pending list
    localThreats=localThreats.slice(apiThreatsBatchLimitItems);
//    log_if_enabled(data,'adtrack_batch');
//    log_if_enabled(localThreats,'adtrack_batch');
  } else {
    // If smaller than limit, get all
    log_if_enabled('-------> GET ALL: '+(localThreats.length),'adtrack_batch');
    // get all
    data=localThreats;
    localThreats=[]; // clear remaining
//    log_if_enabled(data,'adtrack_batch');
//    log_if_enabled(localThreats,'adtrack_batch');
  }
  
  log_if_enabled('[SENDING] SaveThreatsToAPI: '+(data.length)+'/'+(localThreats.length),'adtrack_batch');
  
  // Convert to json before sending
  data = JSON.stringify(data);
  
    var xhr = new XMLHttpRequest();
    xhr.open('POST', TGD_API+"api/adtracks", true);
    xhr.onload = function () {
        if (xhr.readyState == 4) {
  
          log_if_enabled('API Response','adtrack_batch');
          
          // Update status
          apiThreatsBatchIsSending=false;
          
          // if we've got pending items after receiving response, run it again
          if (localThreats.length) {
            log_if_enabled('Pending: '+(localThreats.length),'adtrack_batch');
            var timer_exists=apiThreatsBatchWait?true:false;
            log_if_enabled('Timer exists: '+(timer_exists.toString()),'adtrack_batch');
            if (!timer_exists) {
              if (!apiThreatsBatchWait) { apiThreatsBatchWait = setTimeout(function () {
                  SaveThreatsToAPI();
              }, apiThreatsBatchTimeout); }
            }
          }
          
          // WARNING! Might be evaluating an evil script!
          if (DEBUG && DEBUG_ADTRACK){
            var resp = JSON.parse(xhr.responseText);
            console.log('ADTRACK SALVADA EN EL API');
            console.log('===========================');
            console.log(resp);
            console.log('===========================');
            console.log('');
          }
  
          if ( xhr.status == 200)  {
            if (DEBUG && DEBUG_ADTRACK)
              console.log(xhr.responseText);
          }
          else  {
            console.log( "Error: " + xhr.status + ": " + xhr.statusText);
          }
  
        }
    };
  
    if (DEBUG && DEBUG_ADTRACK){
      console.log('ADTRACK ENVIADA AL API');
      console.log('===========================');
      console.log(data);
      console.log('===========================');
      console.log('');
    }
  
    xhr.send(data);
}

function SaveThreat(threat){
  
  log_if_enabled('SaveThreat','adtrack_batch');
  
  localThreats.push({
    'member_id': threat.member_id,
    'user_id': threat.user_id,
    'category': threat.category,
    'service_name': threat.service_name,
    'service_url': threat.service_url,
    'url': threat.url,
    'domain': threat.domain,
    'usertime': threat.usertime,
    'status': threat.status,
    'language_support': threat.language_support
  });
  
  if (!apiThreatsBatchThrottle) { clearTimeout(apiThreatsBatchWait); apiThreatsBatchWait = null; }
  if (!apiThreatsBatchWait) { apiThreatsBatchWait = setTimeout(function () {
      SaveThreatsToAPI();
  }, apiThreatsBatchTimeout); }

}

function SaveQuery(query){

  var data = new FormData();
  data.append('member_id', query.member_id);
  data.append('user_id', query.user_id);
  data.append('provider', query.provider);
  data.append('data', query.data);
  data.append('query', query.query);
  data.append('lang', query.lang);
  data.append('usertime', query.usertime);
  data.append('share', query.share);
  data.append('language_support', query.language_support);
  
  var xhr = new XMLHttpRequest();
  xhr.open('POST', TGD_API+"api/queries", true);
  xhr.onload = function () {
      if (xhr.readyState == 4) {
        // WARNING! Might be evaluating an evil script!

        if (DEBUG  && DEBUG_QUERY){
          var resp = JSON.parse(xhr.responseText);
          console.log('QUERY SALVADA EN EL API');
          console.log('===========================');
          console.log(resp);
          console.log('===========================');
          console.log('');
        }

        if ( xhr.status == 200)  {
          if (DEBUG && DEBUG_QUERY)
            console.log(xhr.responseText);
        }
        else  {
          console.log( "Error: " + xhr.status + ": " + xhr.statusText);
        }

      }
  };

  if (DEBUG && DEBUG_QUERY){
    console.log('QUERY ENVIADA AL API');
    console.log('===========================');
    console.log(data);
    console.log('===========================');
    console.log('');
  }

  xhr.send(data);

}

function SaveInterestCategories(browsing){

    var data = new FormData();
    data.append('member_id', browsing.member_id);
    data.append('user_id', browsing.user_id);
    data.append('domain', browsing.domain);

    var xhr = new XMLHttpRequest();
    xhr.open('POST', TGD_API+"api/interestCategories", true);
    xhr.onload = function () {
        if (xhr.readyState == 4) {
            // WARNING! Might be evaluating an evil script!

            var resp = JSON.parse(xhr.responseText);
            log_if_enabled('INTEREST CATEGORIES API','interestCategories');
            log_if_enabled('===========================','interestCategories');
            log_if_enabled(resp,'interestCategories');
            log_if_enabled('===========================','interestCategories');
            log_if_enabled('','interestCategories');


            if ( xhr.status == 200)  {
                log_if_enabled(xhr.responseText,'interestCategories');
            }
            else  {
                log_if_enabled( "Error: " + xhr.status + ": " + xhr.statusText,'interestCategories');
            }
        }
    };

    log_if_enabled('INTEREST CATEGORIES API','browsing');
    log_if_enabled('===========================','interestCategories');
    log_if_enabled(data,'interestCategories');
    log_if_enabled('===========================','interestCategories');
    log_if_enabled('','interestCategories');


    xhr.send(data);
}

function syncQueriesBlacklist(){

  var queriesBlacklist=localStorage.queriesBlacklist
  var member_id = localStorage.member_id;

  var xhr = new XMLHttpRequest();
  var url = TGD_API+"api/queriesBlacklist/";
  xhr.onreadystatechange = function()  {
    if ( xhr.readyState == 4)  {

      if (DEBUG && DEBUG_QUERY_BLACKLIST){
          var resp = JSON.parse(xhr.responseText);
          console.log('QUERY BLACKLIST SALVADA EN EL API');
          console.log('===========================');
          console.log(resp);
          console.log('===========================');
          console.log('');
      }

      if ( xhr.status == 200)  {

          localStorage.queriesBlacklist = xhr.responseText;

          var blacklist = JSON.parse(localStorage.queriesBlacklist)

          var length = blacklist.length;   
          for (var i = 0; i < length; i++) {
            var value=blacklist[i];
          }

          if (DEBUG && DEBUG_QUERY_BLACKLIST)
            console.log(xhr.responseText);
        }
        else  {
          console.log( "Error: " + xhr.status + ": " + xhr.statusText);
        }
    }
  }
  xhr.open( 'GET', url, true);

  if (DEBUG && DEBUG_QUERY_BLACKLIST){
    console.log('QUERY BLACKLIST  ENVIADA AL API');
    console.log('===========================');
    console.log(localStorage.queriesBlacklist);
    console.log('===========================');
    console.log('');
  }

  xhr.send();

} 

function syncWhitelist(){

  /**
   * This feature gets disabled for now until future optimization.
   */ 
  return false;
  
  var whitelist=localStorage.whitelist;
  var user_id=localStorage.user_id;
  var member_id = localStorage.member_id;

  var xhr = new XMLHttpRequest();
  var url = TGD_API+"api/whitelists/"+user_id+"/"+member_id;
  xhr.onreadystatechange = function()  {
    if ( xhr.readyState == 4)  {

      if (DEBUG && DEBUG_WHITELIST){
          var resp = JSON.parse(xhr.responseText);
          console.log('WHITELIST SALVADA EN EL API');
          console.log('===========================');
          console.log(resp);
          console.log('===========================');
          console.log('');
      }

      if ( xhr.status == 200)  {

          //localStorage.whitelist = xhr.responseText;

          if (DEBUG && DEBUG_WHITELIST)
            console.log(xhr.responseText);
        }
        else  {
          console.log( "Error: " + xhr.status + ": " + xhr.statusText);
        }
    }
  }
  xhr.open( 'PUT', url, true);

  if (DEBUG && DEBUG_WHITELIST){
    console.log('WHITELIST ENVIADA AL API');
    console.log('===========================');
    console.log(localStorage.whitelist);
    console.log('===========================');
    console.log('');
  }
  
  /**
   * TODO:
   * - Loop on all services for all domains
   * - Get urls for all services
   * - Add urls to another array
   * - Modify the request to send both the full whitelist and the urls list
   * - Now we can create a new adtrack_service inside the api if it is missing
   */

  xhr.send( localStorage.whitelist);

} 



function deleteQueries(callback_success,callback_fail){

  var value=0;
  if (localStorage.member_id != 0){
    value=localStorage.member_id;
  }
  else
  {
    value=localStorage.user_id;
  }

  var xhr = new XMLHttpRequest();
  var url = TGD_API+"api/queries/delete/"+value;
  xhr.onreadystatechange = function()  {
    if ( xhr.readyState == 4)  {

      if (DEBUG && DEBUG_DELETE_QUERIES){
          var resp = xhr.responseText;
          console.log('DELETE QUERIES DESDE API');
          console.log('===========================');
          console.log(resp);
          console.log('===========================');
          console.log('');
      }

      if ( xhr.status == 200)  
      {
        callback_success();
      }
      else  
      {
        console.log( "Error: " + xhr.status + ": " + xhr.statusText);
        callback_fail(xhr.statusText);
      } 
    }
  }
  xhr.open( 'GET', url, true);

  if (DEBUG && DEBUG_DELETE_QUERIES){
    console.log('DELETE QUERIES ENVIADA AL API');
    console.log('===========================');
    console.log('===========================');
    console.log('');
  }

  xhr.send();

}

function renderExtensionIcon() {
  
  var hasUnreadAchievements=false;
  if (typeof(localStorage.hasUnreadAchievements)!=='undefined') {
    hasUnreadAchievements=castBool(localStorage.hasUnreadAchievements);
  }
  
  if (hasUnreadAchievements) {
    if (localStorage.member_id == 0) {
      chrome.runtime.sendMessage({ "newIconPath" : 'images/messagebw.png' });
    }else{
      chrome.runtime.sendMessage({ "newIconPath" : 'images/message.png' }); 
    }
  } else {
    if (localStorage.member_id == 0) {
      chrome.runtime.sendMessage({ "newIconPath" : 'images/19bw.png' });
    }else{
      chrome.runtime.sendMessage({ "newIconPath" : 'images/19.png' }); 
    }
  }
  
}

/**
 * Logs user in from the popup login form
 */
function loginUser(username, password, callback_success, callback_fail) {

  var data = new FormData();
  data.append('UserLogin[username]', username);
  data.append('UserLogin[password]', password);
  data.append('UserLogin[rememberMe]', 1);
  
  var xhr = new XMLHttpRequest();
  xhr.open('POST', TGD_API+"api/login", true);
  xhr.onload = function () {
      if (xhr.readyState == 4) {
        if ( xhr.status == 200)  {
            var resp = JSON.parse(xhr.responseText);
            log_if_enabled('LOGIN RESPONSE','login');
            log_if_enabled('===========================','login');
            log_if_enabled(resp,'login');
            log_if_enabled('===========================','login');
            log_if_enabled('','login');
            
            if (resp.success) {
              get_logged_user(callback_success, function () {});
            } else {
              var errorMsg='';
              if (resp.errors && resp.errors[0]) {
                errorMsg=resp.errors[0];
              }
              callback_fail(errorMsg);
            }
        }
        else  {
          log_if_enabled( "Error: " + xhr.status + ": " + xhr.statusText,'login');
        }
      }
  };

  log_if_enabled('LOGIN REQUEST','login');
  log_if_enabled('===========================','login');
  log_if_enabled(data,'login');
  log_if_enabled('===========================','login');
  log_if_enabled('','login');

  xhr.send(data);

}

/**
 * Actually request the webapp and asks if the user is logged in and 
 * then saves login or logout status in localstorage.
 * This is used in more places:
 * - After login form submit
 * - After clicking on logout
 * - After completely loading a tab so user gets 'auto-logged-in'
 */
function get_logged_user(callback_logged, callback_notLogged) {
  
  var data = new FormData();
  
  data.append('user_id', localStorage.user_id);
  
  // make request to get the logged user
  var xhr = new XMLHttpRequest();
  xhr.open('POST', TGD_API+"api/getLoggedUser", true);
  xhr.onload = function () {
      if (xhr.readyState == 4) {
        if ( xhr.status == 200)  {
            var resp = JSON.parse(xhr.responseText);
            log_if_enabled('get_logged_user RESPONSE','login');
            log_if_enabled('===========================','login');
            log_if_enabled(resp,'login');
            log_if_enabled('===========================','login');
            log_if_enabled('','login');
            
            if (resp.id) {
              
              var member_id=resp.id;
              var member_username = resp.username;
              
              // if user is logged in and it's the same as the local storage 
              if (localStorage.member_username && localStorage.member_username == member_username) {
                // do nothing
              } else {
                // if not logged or logged but different, set/change user
                localStorage.member_username = member_username;
                localStorage.member_id = member_id;
                log_if_enabled('Almacenado member_id : '+localStorage.member_id,'login');
              }
              
              // restore user settings
              restoreUserSettingsFromApi(resp.settings);
              
              // callback_success
              callback_logged();
            
            } else {
              // if user not logged in, log him out also from the local storage
              localStorage.member_id = 0;
              localStorage.member_username='';
              callback_notLogged();
            }
            
            // update icon 
            renderExtensionIcon();
            
        }
        else  {
          log_if_enabled( "Error: " + xhr.status + ": " + xhr.statusText,'login');
        }
      }
  };

  log_if_enabled('get_logged_user REQUEST','login');
  log_if_enabled('===========================','login');
  log_if_enabled(data,'login');
  log_if_enabled('===========================','login');
  log_if_enabled('','login');

  xhr.send(data);
  
}


/**
 * Saves user settings to API
 */
function saveUserSettingsToAPI() {

  var data = new FormData();
  
  var keys = saveUserSettings_getKeys();
  
  for (var key in keys) {
    if (keys.hasOwnProperty(key)) {
      if (typeof(localStorage[key])!='undefined') {
        data.append(key, localStorage[key]);
      }
    }
  }
  
  var xhr = new XMLHttpRequest();
  xhr.open('POST', TGD_API+"api/saveUserSettings", true);
  xhr.onload = function () {
      if (xhr.readyState == 4) {
        if ( xhr.status == 200)  {
            var resp = JSON.parse(xhr.responseText);
            log_if_enabled('saveUserSettings RESPONSE','saveUserSettings');
            log_if_enabled('===========================','saveUserSettings');
            log_if_enabled(resp,'saveUserSettings');
            log_if_enabled('===========================','saveUserSettings');
            log_if_enabled('','saveUserSettings');
            
            if (resp.success) {
              log_if_enabled('SAVED!','saveUserSettings');
            } else {
              log_if_enabled('NOT SAVED!','saveUserSettings');
              if (resp.errors) {
                for (i_e = 0; i_e < resp.errors.length; i_e++) {
                  log_if_enabled('Error: '+resp.errors[i_e],'saveUserSettings');
                }
              }
            }
        }
        else  {
          log_if_enabled( "Error: " + xhr.status + ": " + xhr.statusText,'saveUserSettings');
        }
      }
  };

  log_if_enabled('saveUserSettings REQUEST','saveUserSettings');
  log_if_enabled('===========================','saveUserSettings');
  log_if_enabled(data,'saveUserSettings');
  log_if_enabled('===========================','saveUserSettings');
  log_if_enabled('','saveUserSettings');

  xhr.send(data);

}

// Add here to this array any new configuration key that will be required
// and don't forget to add it also in the webapp's list of ExtensionSettings::$_allowed_keys
// please define them as 'name' => 'type', you should specify a type to make sure the restore 
// command will bring them back to their original state
function saveUserSettings_getKeys() {
  return {
    'store_navigation':'bool'
//    ,'number_test':'int'
//    ,'string_test':'text'
  };
}

/**
 * Restores the user settings got from the API back into the localStorage
 */
function restoreUserSettingsFromApi(settings) {
  log_if_enabled('restoreUserSettingsFromApi','saveUserSettings');
  var keys = saveUserSettings_getKeys();
  for (var key in keys) {
    if (keys.hasOwnProperty(key)) {
      if (settings[key]) {
        var value=settings[key];
        var type=keys[key];
        switch (type) {
          case 'bool':
            value=castBool(value);
            break;
          case 'int':
            value=parseInt(value);
            break;
          case 'text':
            value=String(value);
            break;
        }
        log_if_enabled('key: '+key+' type: '+type,'saveUserSettings');
        log_if_enabled(value,'saveUserSettings');
        localStorage[key]=value;
      }
    }
  }
}

function getDataFromQuery(requested_url, searchEngineName){
  var paramJSON = {};

  if (searchEngineName == 'google')
  {
    if (requested_url.indexOf("?") != -1)
    {
      requested_url=requested_url.replace("#q=","&q=");
    }
    else
    { 
      requested_url=requested_url.replace("#q=","?q=");
    }
    
  }
  
  try
  {
    var parameters = requested_url.split("?")[1].split("&");
    var excludeParam = new Array;
    var url_params = "/?s=" + C_MN;
    
    if(requested_url.indexOf("se=") == -1)
      url_params += "&se=" + searchEngineName;

    var alreadyHasQ = false;

    for (var i=0; i<parameters.length; i++) {
      var aux = parameters[i].split("=");
      if (aux[0] == "q" || aux[0] == "p") {
        if (searchEngineName == 'yahoo') aux[0] = "q";
        aux[1] = aux[1].replace(/'/g, "%27");
      }
      if(!alreadyHasQ) paramJSON[aux[0]] = aux[1];
      //if(aux[0] == "q") alreadyHasQ = true;
    }
    for (var i=0; i<excludeParam.length; i++) {
      delete paramJSON[excludeParam[i]];
    }
    
  }
  catch(err)
  {

  }
  
  return paramJSON;
};

// tool to parse url
var parseUri_options = {
    strictMode: false,
    key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
    q:   {
            name:   "queryKey",
            parser: /(?:^|&)([^&=]*)=?([^&]*)/g
    },
    parser: {
            strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
            loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
    }
};
function parseUri(str) {
    var	o   = parseUri_options,
            m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
            uri = {},
            i   = 14;

    while (i--) uri[o.key[i]] = m[i] || "";

    uri[o.q.name] = {};
    uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
            if ($1) uri[o.q.name][$1] = $2;
    });

    return uri;
}

function log_if_enabled(msg, category) {
  if (DEBUG) {
      if (category && log_categories[category] === false) {
          return;
      }
      console.log(msg);
  }
}