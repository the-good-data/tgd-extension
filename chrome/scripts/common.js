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
  const WHITELIST = {};
  const SITE_WHITELIST = {};
  localStorage.whitelist = JSON.stringify(WHITELIST);
}

//Add services to whitelist
function addWhitelist(DOMAIN,service_name, category, status){
  const WHITELIST = deserialize(localStorage.whitelist) || {};
  const SITE_WHITELIST = WHITELIST[DOMAIN] || (WHITELIST[DOMAIN] = {});

  WHITELIST[DOMAIN][service_name+':'+category]=!status;
  localStorage.whitelist = JSON.stringify(WHITELIST);
}

//Get status whitelisted service
function getWhitelistStatus(DOMAIN,tab,service_name,category){
  const WHITELIST = deserialize(localStorage.whitelist) || {};
  const SITE_WHITELIST = WHITELIST[DOMAIN] || (WHITELIST[DOMAIN] = {});
  
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
  const WHITELIST = deserialize(localStorage.whitelist) || {};
  const SITE_WHITELIST = WHITELIST[DOMAIN] || (WHITELIST[DOMAIN] = {});
  
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
  const WHITELIST = deserialize(localStorage.whitelist) || {};
  const SITE_WHITELIST = WHITELIST[DOMAIN] || (WHITELIST[DOMAIN] = {});

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
  const ARRAY = [];
  for (var i = 0; i < length; i++) ARRAY[i] = defaultValue;
  return ARRAY;
}

/* Destringifies an object. */
function deserialize(object) {
  return typeof object == 'string' ? JSON.parse(object) : object;
}

/* Rewrites a generic cookie with specific domains and paths. */
function mapCookie(cookie, storeId, url, domain, subdomains, paths) {
  const MINIMIZE = Math.min;
  const SUBDOMAIN_COUNT = MINIMIZE(subdomains.length, 20);
      // Chrome won't persist more than 22 domains because of cookie limits.
  delete cookie.hostOnly;
  delete cookie.session;
  const DOMAIN = cookie.domain;

  for (var i = 0; i < SUBDOMAIN_COUNT; i++) {
    var subdomain = subdomains[i];
    cookie.url = url.replace('www', subdomain).replace('search', subdomain);
    cookie.domain = subdomain + domain;
    COOKIES.set(cookie);
  }

  const PATH_COUNT = MINIMIZE(paths.length, 10);
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
    const STORE_COUNT = cookieStores.length;
    const DOMAIN = '.' + service[1][0];
    const SUBDOMAINS = service[2];
    const PATHS = service[3];

    for (var i = 0; i < STORE_COUNT; i++) {
      var storeId = cookieStores[i].id;

      COOKIES.getAll({url: url, storeId: storeId}, function(cookies) {
        const COOKIE_COUNT = cookies.length;
        for (var j = 0; j < COOKIE_COUNT; j++)
            mapCookie(cookies[j], storeId, url, DOMAIN, SUBDOMAINS, PATHS);
      });
    }
  });
}

/* Erases a batch of cookies. */
function deleteCookies(url, domain, path, storeId, name) {
  const DETAILS = {url: url, storeId: storeId};
  if (name) DETAILS.name = name;

  COOKIES.getAll(DETAILS, function(cookies) {
    const COOKIE_COUNT = cookies.length;

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
    const STORE_COUNT = cookieStores.length;
    const SUBDOMAINS = service[2];
    const SUBDOMAIN_COUNT = SUBDOMAINS.length;
    const DOMAIN = '.' + service[1][0];
    const PATHS = service[3];
    const PATH_COUNT = PATHS.length;

    for (var i = 0; i < STORE_COUNT; i++) {
      var storeId = cookieStores[i].id;

      for (var j = 0; j < SUBDOMAIN_COUNT; j++) {
        var subdomain = SUBDOMAINS[j];
        var mappedUrl =
            url.replace('www', subdomain).replace('search', subdomain);

        if (!name && !j) {
          COOKIES.getAll({url: mappedUrl, storeId: storeId}, function(cookies) {
            const COOKIE_COUNT = cookies.length;

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

function CheckLanguagesSupport(lang,callback){

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

function LoadAchievements(callback){

  var xhr = new XMLHttpRequest();
  xhr.open('GET', TGD_API+"api/achievements", true);
  xhr.onload = function () {
      if (xhr.readyState == 4) {
        // WARNING! Might be evaluating an evil script!
        
        if (DEBUG && DEBUG_ARCHIVEMENTS){
          var resp = JSON.parse(xhr.responseText);
          console.log('ACHIVEMENTS RECUPERADAS EN EL API');
          console.log('===========================');
          console.log(resp);
          console.log('===========================');
          console.log('');
        }

        if ( xhr.status == 200)  {
          if (DEBUG && DEBUG_ARCHIVEMENTS)
            console.log(xhr.responseText);
        }
        else  {
          console.log( "Error: " + xhr.status + ": " + xhr.statusText);
        }

        var resp = JSON.parse(xhr.responseText);
        callback(resp);
      }
  };

  if (DEBUG && DEBUG_ARCHIVEMENTS){
    console.log('LISTADO DE ACHIVEMENTS ENVIADA AL API');
    console.log('===========================');
    console.log('===========================');
    console.log('');
  }

  xhr.send();
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

function SaveThreat(threat){

  var data = new FormData();
  data.append('member_id', threat.member_id);
  data.append('user_id', threat.user_id);
  data.append('category', threat.category);
  data.append('service_name', threat.service_name);
  data.append('service_url', threat.service_url);
  data.append('url', threat.url);
  data.append('domain', threat.domain);
  data.append('usertime', threat.usertime);
  data.append('status', threat.status);
  data.append('language_support',threat.language_support)

  var xhr = new XMLHttpRequest();
  xhr.open('POST', TGD_API+"api/adtracks", true);
  xhr.onload = function () {
      if (xhr.readyState == 4) {

        
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

  
  var whitelist=localStorage.whitelist
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

function loginUser(username,password, callback_success,callback_fail){

  password = hex_md5(SALT + password);
  
  var xhr = new XMLHttpRequest();
  var url = TGD_API+"api/user/username/"+username+"/password/"+password;
  xhr.onreadystatechange = function()  {
    if ( xhr.readyState == 4)  {

      if (DEBUG && DEBUG_CREDENTIAL){
          var resp = xhr.responseText;
          console.log('CREDENTIAL SALVADA EN EL API');
          console.log('===========================');
          console.log(resp);
          console.log('===========================');
          console.log('');
      }

      if ( xhr.status == 200)  
      {
        var members = JSON.parse(xhr.responseText);
        var member_id=members[0].id;
        var member_username = members[0].username;
        
        localStorage.member_username = member_username;
        localStorage.member_id = member_id;
        console.log('Almacenado member_id : '+localStorage.member_id);
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

  if (DEBUG && DEBUG_CREDENTIAL){
    console.log('CREDENTIAL ENVIADA AL API');
    console.log('===========================');

    var data = new Array();
    data['username']=username;
    data['password']=password;

    console.log(data);
    console.log('===========================');
    console.log('');
  }

  xhr.send();

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