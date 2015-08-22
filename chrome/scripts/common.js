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
 * Variable where we store temporary local threats
 * @type Array
 */
 var local_threats                =[];
 
 /**
 * The timeout object
 * @type setTimeout
 */
 var api_threats_batch_wait       =null;
 
 /**
 * The time to wait in miliseconds
 * @type Number
 */
 var api_threats_batch_timeout    =10000;
 
 /**
 * Throttle or not the batch, true means every time api_threats_batch_timeout 
 * passes then it will be run once while false means it will only run one time.
 * @type Boolean
 */
 var api_threats_batch_throttle   =true;
 
 /**
 * Know if a request to save adtracks is already running
 * @type Boolean
 */
 var api_threats_batch_is_sending =false;
 
 /**
 * How many items to process per request?
 * @type Number
 */
 var api_threats_limit_items      =50;





////////////////////////
// Tool to parse url  //
////////////////////////

/**
 * Options for the parseUri function.
 * @type {Object}
 */
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

/**
 * Parses an URI and stores its pieces in an object.
 * @param  {String} str   The URI to parse.
 * @return {Object}       The resulting object.
 */
function parseUri(str) {
    var o   = parseUri_options,
            m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
            uri = {},
            i   = 14;

    while (i--) {
      uri[o.key[i]] = m[i] || "";
    }

    uri[o.q.name] = {};
    uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
            if ($1) uri[o.q.name][$1] = $2;
    });

    return uri;
}




//////////////////////
// Helper functions //
//////////////////////

/**
 * Checks if an item exists in an object/array.
 * @param  {Obect} a    Haystack.
 * @param  {mixed} obj  Needle
 * @return {Boolean}    True if the item is found, false otherwise.
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
  var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g;
  var timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g;
  var timezoneClip = /[^-+\dA-Z]/g;
  var pad = function (val, len) {
      val = String(val);
      len = len || 2;
      while (val.length < len) {
        val = "0" + val;
      }
      return val;
    };

  // Regexes and supporting functions are cached through closure
  return function (date, mask, utc) {
    var dF = dateFormat;

    // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
    if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !(/\d/.test(date))) {
      mask = date;
      date = undefined;
    }

    // Passing date through Date applies Date.parse, if necessary
    date = date ? new Date(date) : new Date;
    if (isNaN(date)) {
      throw SyntaxError("invalid date");
    }

    mask = String(dF.masks[mask] || mask || dF.masks["default"]);

    // Allow setting the utc argument via the mask
    if (mask.slice(0, 4) == "UTC:") {
      mask = mask.slice(4);
      utc = true;
    }

    var _ = utc ? "getUTC" : "get";
    var d = date[_ + "Date"]();
    var D = date[_ + "Day"]();
    var m = date[_ + "Month"]();
    var y = date[_ + "FullYear"]();
    var H = date[_ + "Hours"]();
    var M = date[_ + "Minutes"]();
    var  s = date[_ + "Seconds"]();
    var  L = date[_ + "Milliseconds"]();
    var o = utc ? 0 : date.getTimezoneOffset();
    var flags = {
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
  dayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  monthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
};

// For convenience...
Date.prototype.format = function (mask, utc) {
  return dateFormat(this, mask, utc);
};

/**
 * Generate a Hashtable
 */
function Hash() {
  this.length = 0;
  this.items  = new Array();
  for (var i = 0; i < arguments.length; i += 2) {
    if (typeof(arguments[i + 1]) != 'undefined') {
      this.items[arguments[i]] = arguments[i + 1];
      this.length++;
    }
  }

  this.removeItem = function(in_key)  {
      var tmp_value;
      if (typeof(this.items[in_key]) != 'undefined') {
          this.length--;
          tmp_value = this.items[in_key];
          delete this.items[in_key];
      }
      return tmp_value;
  };

  this.getItem = function(in_key) {
      return this.items[in_key];
  };

  this.setItem = function(in_key, in_value) {
    if (typeof(in_value) != 'undefined') {
      if (typeof(this.items[in_key]) == 'undefined') {
          this.length++;
      }

      this.items[in_key] = in_value;
    }
    return in_value;
  };

  this.hasItem = function(in_key) {
    return typeof(this.items[in_key]) != 'undefined';
  };
}

/**
 * Gets the domain name of a URL.
 * @param  {String} data URL to get the domain name from.
 * @return {String}      The hostname of the given URL.
 */
function getDomainName(data) {
  var a = document.createElement('a');
  a.href = data;
  return a.hostname;
}

/**
 * Cast string to boolean values
 * @param  {String} str   String to be coverted.
 * @return {Boolean}      Boolean result.
 */
function castBool(str) {
  if (typeof(str) != "undefined" && str.toLowerCase() === 'true') {
    return true;
  } else if (str != undefined && str.toLowerCase() === 'false') {
    return false;
  }
  return false;
}

/**
 * Generate a user_id for anoyonymous user.
 * @return {String} The Unique User Id.
 */
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

/**
 * Destringifies an object. It @package rses the string using the JSON.parse() method.
 * @param  {String} str   The string representation of an object.
 * @return {Object}       The object.
 */
function deserialize(str) {
  return typeof str == 'string' ? JSON.parse(str) : str;
} 

/**
 * Renders the extension icon depending on wether there are any pending messages and the user is logged in.
 * @return {undefined} 
 */
function renderExtensionIcon() {
  
  var has_unread_achievements = false;

  if (typeof(localStorage.hasUnreadAchievements) != 'undefined') {
    has_unread_achievements = castBool(localStorage.hasUnreadAchievements);
  }
  
  if (has_unread_achievements) {
    if (localStorage.member_id == "0") {
      chrome.runtime.sendMessage({ "newIconPath" : 'images/messagebw.png' });
    }else{
      chrome.runtime.sendMessage({ "newIconPath" : 'images/message.png' }); 
    }
  } else {
    if (localStorage.member_id == "0") {
      chrome.runtime.sendMessage({ "newIconPath" : 'images/19bw.png' });
    }else{
      chrome.runtime.sendMessage({ "newIconPath" : 'images/19.png' }); 
    }
  }
}



/////////////////////////
// Whitelist functions //
/////////////////////////

/**
 * Reset entire whitelist.
 * @return {undefined}
 */
function resetEntireWhitelist(){
  var whitelist = {};
  localStorage.whitelist = JSON.stringify(whitelist);
}

/**
 * Get the whitelist status for a service:category pair.
 * @param  {String} service_name  Service name.
 * @param  {String} category      Category.
 * @return {Boolean}              True if it is whitelisted, false otherwise.
 */
function getWhitelistStatus(service_name, category){
  var whitelist = deserialize(localStorage.whitelist) || {};
  
  if (typeof(whitelist[service_name + ':' + category]) == "undefined") {
    return false;
  } else {
    return whitelist[service_name + ':' + category];
  }
}

/**
 * Set status whitelisted service.
 * @param {String} service_name   The service name.
 * @param {String} category       The category.
 * @param {Boolean} status        Whitelist status.
 */
function setWhitelistStatus(service_name, category, status){
  var whitelist = deserialize(localStorage.whitelist) || {};
  
  if(status) {
    whitelist[service_name + ':' + category] = status;
  } else {
    if(category == CONTENT_NAME || category == SOCIAL_NAME) {
      whitelist[service_name + ':' + category] = status;
    } else {
      delete whitelist[service_name + ':' + category];
    }
  }
  localStorage.whitelist = JSON.stringify(whitelist);
}





///////////////////////////////
// Allow all threats in site //
///////////////////////////////

/**
 * Get value if actual tab is deactivate
 * @param  {String}  domain   Domain to which any threats will be allowed.
 * @return {Boolean}          Status.
 */
function setAllowThreatsInCurrent(domain, status){
  var whitelist = deserialize(localStorage.whitelist) || {};
  
  if (status) {
    console.log("setting WL for " + domain + " to :" + status);
    whitelist.all_threats_allowed[domain] = status;
  } else {
    console.log("usetting WL for " + domain + " to :" + status);
    delete whitelist.all_threats_allowed[domain];
  }
  
  localStorage.whitelist = JSON.stringify(whitelist);
}

/**
 * Get value if actual tab is deactivate
 * @param  {String}  domain   Domain to get the whitelist status.
 * @return {Boolean}          True if threats are allowed, false otherwise.
 */
function getAllowThreatsInCurrent(domain){
  var whitelist = deserialize(localStorage.whitelist) || {};

  if(typeof(whitelist.all_threats_allowed[domain]) != "undefined" && whitelist.all_threats_allowed[domain] === true) {
    return true;
  }

  return false;
}





///////////////////////
// Cookies functions //
///////////////////////

/**
 * Rewrites a generic cookie with specific domains and paths.
 * @param  {[type]} cookie     [description]
 * @param  {[type]} storeId    [description]
 * @param  {[type]} url        [description]
 * @param  {[type]} domain     [description]
 * @param  {[type]} subdomains [description]
 * @param  {[type]} paths      [description]
 * @return {[type]}            [description]
 */
// function mapCookie(cookie, storeId, url, domain, subdomains, paths) {
//   var MINIMIZE = Math.min;
//   var SUBDOMAIN_COUNT = MINIMIZE(subdomains.length, 20);
//       // Chrome won't persist more than 22 domains because of cookie limits.
//   delete cookie.hostOnly;
//   delete cookie.session;
//   var DOMAIN = cookie.domain;

//   for (var i = 0; i < SUBDOMAIN_COUNT; i++) {
//     var subdomain = subdomains[i];
//     cookie.url = url.replace('www', subdomain).replace('search', subdomain);
//     cookie.domain = subdomain + domain;
//     COOKIES_API.set(cookie);
//   }

//   var PATH_COUNT = MINIMIZE(paths.length, 10);
//       // Chrome won't persist more than 11 paths.
//   cookie.domain = DOMAIN;

//   for (i = 0; i < PATH_COUNT; i++) {
//     var path = paths[i];
//     cookie.url = url + path;
//     cookie.path = '/' + path;
//     COOKIES_API.set(cookie);
//   }

//   COOKIES_API.remove({url: url, name: cookie.name, storeId: storeId});
// }

/**
 * Rewrites a batch of generic cookies with specific domains and paths.
 * @param  {String} url     URL of the cookie.
 * @param  {String} service [description]
 * @return {undefined}         
 */
// function mapCookies(url, service) {
//   COOKIES_API.getAllCookieStores(function(cookieStores) {
//     var store_count = cookieStores.length;
//     var domain      = '.' + service[1][0];
//     var subdomains  = service[2];
//     var paths       = service[3];
//     var storeId; 

//     for (var i = 0; i < store_count; i++) {
//       storeId = cookieStores[i].id;

//       COOKIES_API.getAll({url: url, storeId: storeId}, function(cookies) {
//         var cookie_count = cookies.length;
//         for (var j = 0; j < cookie_count; j++) {
//           mapCookie(cookies[j], storeId, url, domain, subdomains, paths);
//         }
//       });
//     }
//   });
// }

/**
 * Erases a batch of cookies.
 * @param  {[type]} url     [description]
 * @param  {[type]} domain  [description]
 * @param  {[type]} path    [description]
 * @param  {[type]} storeId [description]
 * @param  {[type]} name    [description]
 * @return {[type]}         [description]
 */
// function deleteCookies(url, domain, path, storeId, name) {
//   var DETAILS = {url: url, storeId: storeId};
//   if (name) DETAILS.name = name;

//   COOKIES_API.getAll(DETAILS, function(cookies) {
//     var COOKIE_COUNT = cookies.length;

//     for (var i = 0; i < COOKIE_COUNT; i++) {
//       var cookie = cookies[i];
//       if (cookie.domain == domain && cookie.path == path)
//           COOKIES_API.remove(
//             {url: url, name: name || cookie.name, storeId: storeId}
//           );
//     }
//   });
// }

/**
 * Rewrites a batch of specific cookies with a generic domain and path.
 * @param  {[type]} url     [description]
 * @param  {[type]} service [description]
 * @param  {[type]} name    [description]
 * @return {[type]}         [description]
 */
// function reduceCookies(url, service, name) {
//   COOKIES_API.getAllCookieStores(function(cookieStores) {
//     var STORE_COUNT = cookieStores.length;
//     var SUBDOMAINS = service[2];
//     var SUBDOMAIN_COUNT = SUBDOMAINS.length;
//     var DOMAIN = '.' + service[1][0];
//     var PATHS = service[3];
//     var PATH_COUNT = PATHS.length;

//     for (var i = 0; i < STORE_COUNT; i++) {
//       var storeId = cookieStores[i].id;

//       for (var j = 0; j < SUBDOMAIN_COUNT; j++) {
//         var subdomain = SUBDOMAINS[j];
//         var mappedUrl =
//             url.replace('www', subdomain).replace('search', subdomain);

//         if (!name && !j) {
//           COOKIES_API.getAll({url: mappedUrl, storeId: storeId}, function(cookies) {
//             var COOKIE_COUNT = cookies.length;

//             for (var i = 0; i < COOKIE_COUNT; i++) {
//               var details = cookies[i];
//               details.url = url;
//               details.domain = DOMAIN;
//               delete details.hostOnly;
//               delete details.session;

//               setTimeout(function(details) {
//                 COOKIES_API.set(details);
//               }.bind(null, details), 1000);
//             }
//           });
//         }

//         deleteCookies(mappedUrl, '.' + subdomain + DOMAIN, '/', storeId, name);
//       }

//       for (j = 0; j < PATH_COUNT; j++) {
//         var path = PATHS[j];
//         deleteCookies(url + path, DOMAIN, '/' + path, storeId, name);
//       }
//     }
//   });
// }





///////////
// Cache //
///////////

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





/////////////
// Queries //
/////////////

/**
 * Checks if a query is black listed
 * @param  {String}   query    Search query string.
 * @param  {String}   alias    Language alias.
 * @param  {Function} callback Callback to be executed after API call.
 * @return {undefined}            
 */
function checkQuery(query,alias,callback){
  var xhr;
  var data = new FormData();

  xhr= new XMLHttpRequest();
  xhr.open('POST', TGD_API+"api/checkQueriesBlacklist", true);
  xhr.onload = function () {        
    var resp;

    if ( xhr.status == 200)  {
      resp = JSON.parse(xhr.responseText);
      callback(resp);
    }
  };

  data.append('query', query);
  data.append('lang', alias);
  xhr.send(data);
}

/**
 * Get how many queries have been traded/registered.
 * @param {Function} callback Callback to be executed after API call.
 * @return {undefined} 
 */
function loadQueries(callback){

  var value = '';
  var xhr;

  if (localStorage.member_id != "0"){
    value = localStorage.member_id;
  } else {
    value = localStorage.user_id;
  }

  xhr = new XMLHttpRequest();
  xhr.open('GET', TGD_API + "api/queries/count/" + value, true);
  xhr.onload = function () {
    var resp;

    if ( xhr.status == 200)  {
      resp = 0;
      try {
        resp = JSON.parse(xhr.responseText);
        localStorage.queries = resp;
        
      } catch(e){}

      callback(resp);
    } 
  };

  xhr.send();
}

/**
 * Save query to the API.
 * @param {String} query  Search query.
 */
function SaveQuery(query){

  var data = new FormData();
  var xhr = new XMLHttpRequest();
  xhr.open('POST', TGD_API+"api/queries", true);

  data.append('member_id', query.member_id);
  data.append('user_id', query.user_id);
  data.append('provider', query.provider);
  data.append('data', query.data);
  data.append('query', query.query);
  data.append('lang', query.lang);
  data.append('usertime', query.usertime);
  data.append('share', query.share);
  data.append('language_support', query.language_support);
  xhr.send(data);
}

/**
 * Delete search query from database.
 * @param  {Function} callback_success 
 * @param  {Function} callback_fail    
 * @return {undefined}                  
 */
function deleteQueries(callback_success,callback_fail){

  var value = 0;
  var xhr;

  if (localStorage.member_id != "0"){
    value=localStorage.member_id;
  } else {
    value=localStorage.user_id;
  }

  xhr = new XMLHttpRequest();
  xhr.open( 'GET', TGD_API + "api/queries/delete/" + value, true);
  xhr.onload = function()  {
    if ( xhr.status == 200) {
      callback_success();
    } else {
      callback_fail(xhr.statusText);
    } 
  };

  xhr.send();
}

/**
 * Extract query string from the URL.
 * @param  {String} requested_url    
 * @param  {String} searchEngineName 
 * @return {String}                  
 */
function getDataFromQuery(requested_url, searchEngineName){
  var param_JSON = {};
  var parameters;
  var exclude_param;
  var url_params;
  var already_has_q;
  var aux, i;

  if (searchEngineName == 'google') {
    if (requested_url.indexOf("?") != -1) {
      requested_url=requested_url.replace("#q=","&q=");
    } else { 
      requested_url=requested_url.replace("#q=","?q=");
    }
    
  }
  
  try {
    parameters = requested_url.split("?")[1].split("&");
    exclude_param = new Array;
    url_params = "/?s=" + C_MN;
    
    if(requested_url.indexOf("se=") == -1) {
      url_params += "&se=" + searchEngineName;
    }


    already_has_q = false;
    for (i = 0; i<parameters.length; i++) {
      aux = parameters[i].split("=");
      if (aux[0] == "q" || aux[0] == "p") {
        if (searchEngineName == 'yahoo') {
          aux[0] = "q";
        }
        aux[1] = aux[1].replace(/'/g, "%27");
      }
      if(!already_has_q) param_JSON[aux[0]] = aux[1];
      //if(aux[0] == "q") already_has_q = true;
    }

    for (i = 0; i<exclude_param.length; i++) {
      delete param_JSON[exclude_param[i]];
    }
    
  } catch(err){

  }
  
  return param_JSON;
}




/////////////
// Threats //
/////////////

/**
 * Saves threats via API.
 * @return {undefined} 
 */
function saveThreatsToAPI() {
  
  var xhr;
  var data;

  api_threats_batch_wait=null;
  
  if (api_threats_batch_is_sending) {
    // if timeout is bigger than 5s and server did not answer yet, drop pending items
    if (api_threats_batch_timeout >= 5000) {
      local_threats=[]; // drop remaining because server is overloaded
    }
    return;
  }
  
  // Update status
  api_threats_batch_is_sending=true;
  
  
  // Init data to send
  data = {};
  // If bigger than items limit per request, just get first group
  if (local_threats.length > api_threats_limit_items) {
    // get first api_threats_limit_items
    data = local_threats.slice(0, api_threats_limit_items);
    // now remove the first group from the pending list
    local_threats = local_threats.slice(api_threats_limit_items);
  } else {
    // If smaller than limit, get all
    data = local_threats;
    local_threats = []; // clear remaining
  }
  
  // Convert to json before sending
  
    xhr = new XMLHttpRequest();
    xhr.open('POST', TGD_API + "api/adtracks", true);
    xhr.onload = function () {
      var timer_exists;
      // Update status
      api_threats_batch_is_sending = false;
      
      // if we've got pending items after receiving response, run it again
      if (local_threats.length) {
        timer_exists = api_threats_batch_wait ? true : false;
        if (!timer_exists) {
          if (!api_threats_batch_wait) { api_threats_batch_wait = setTimeout(function () {
              saveThreatsToAPI();
          }, api_threats_batch_timeout); }
        }
      }
    };
    
    data = JSON.stringify(data);
    xhr.send(data);
}

/**
 * Save threats using a batch.
 * @param  {SQtring} threat 
 * @return {undefined}        
 */
function saveThreat(threat){
  local_threats.push({
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
  
  if (!api_threats_batch_throttle) { 
    clearTimeout(api_threats_batch_wait); 
    api_threats_batch_wait = null; 
  }

  if (!api_threats_batch_wait) {
    api_threats_batch_wait = setTimeout(function () {
      saveThreatsToAPI();
    }, api_threats_batch_timeout); 
  }
}





//////////////////
// Achievements //
//////////////////

/**
 * Loads achievements from API and executes a callback
 * @param  {Function} callback 
 * @return {Undefined}            
 */
function loadAchievements(callback) {
  
  // check if we've got it cached
  var achievements = jsCache.get('achievements', null);
  var xhr;

  if (achievements !== null) {
    callback(achievements); 
    return;
  }
  
  xhr = new XMLHttpRequest();
  xhr.open('GET', TGD_API+"api/achievements", true);
  xhr.onload = function () {
    var resp;

    if ( xhr.status == 200)  {
      resp = JSON.parse(xhr.responseText);
      // now save results to cache 
      jsCache.set('achievements', resp, 10);
      callback(resp);
    }         
  };

  xhr.send();
}

/**
 * Checks the list of achievements we've got from the API and sets the
 * unreadAchievements variable and updates the extension icon.
 * @param  {Array} items 
 * @return {undefined}  
 */
function checkUnreadAchievements(items) {
  
  var readAchievements = deserialize(localStorage.readAchievements) || [];
  var unreadCount = 0;
  
  for (var i = 0; i < items.length; i++) {
    if (readAchievements.indexOf(items[i].id) === -1) {
      unreadCount++;
    }
  }
  
  if (unreadCount) {
    localStorage.hasUnreadAchievements = true;
  } else {
    localStorage.hasUnreadAchievements = false;
  }
  
  // update icon 
  renderExtensionIcon();
}

/**
 * Mark a specific achievement as read by its ID and then recheck unread
 * @param  {Number} id 
 * @return {undefined}    
 */
function markAchievementAsRead(id) {
  var readAchievements = deserialize(localStorage.readAchievements) || [];
  readAchievements.push(id);
  localStorage.readAchievements = JSON.stringify(readAchievements);
  loadAchievements(checkUnreadAchievements);
}





///////////
// Login //
///////////

/**
 * Logs user in from the popup login form.
 * @param {String}                    username Username.
 * @param {String}                    password Password.
 * @param {Function} callback_succes  Function to run upon successful login.
 * @param {Function} callback_fail    Function to run upon filed login.
 * @return {undefined}
 */
function loginUser(username, password, callback_success, callback_fail) {

  var data = new FormData();
  
  var xhr = new XMLHttpRequest();
  xhr.open('POST', TGD_API + "api/login", true);
  xhr.onload = function () {
    var error_msg;
    if ( xhr.status == 200)  {
      if (resp.success) {
        getLoggedUser(callback_success, function () {});
      } else {
        if (resp.errors && resp.errors[0]) {
          errorMsg = resp.errors[0];
        }
        callback_fail(errorMsg);
      }
    }
  };


  data.append('UserLogin[username]', username);
  data.append('UserLogin[password]', password);
  data.append('UserLogin[rememberMe]', 1);
  xhr.send(data);
}

/**
 * Actually request the webapp and asks if the user is logged in and 
 * then saves login or logout status in localstorage.
 * This is used in more places:
 * - After login form submit
 * - After clicking on logout
 * - After completely loading a tab so user gets 'auto-logged-in'
 * @param {Function} callback_logged 
 * @param {Function} callback_notLogged 
 */
function getLoggedUser(callback_logged, callback_notLogged) {
  
  var data = new FormData();
  
  // make request to get the logged user
  var xhr = new XMLHttpRequest();
  xhr.open('POST', TGD_API+"api/getLoggedUser", true);
  xhr.onload = function () {
    var resp;
    var member_id;
    var member_username;
    if ( xhr.status == 200)  {
      resp = JSON.parse(xhr.responseText);
      if (resp.id) {
        member_id       = resp.id;
        member_username = resp.username;
        // if user is logged in and it's the same as the local storage 
        if (localStorage.member_username && localStorage.member_username == member_username) {
          'do nothing';// do nothing
        } else {
          // if not logged or logged but different, set/change user
          localStorage.member_username = member_username;
          localStorage.member_id       = member_id;
        }
        
        // restore user settings
        restoreUserSettingsFromApi(resp.settings);
        
        // callback_success
        callback_logged();
      } else {
        // if user not logged in, log him out also from the local storage
        localStorage.member_id       = 0;
        localStorage.member_username = '';
        callback_notLogged();
      }
      
      // update icon 
        renderExtensionIcon();
    }
  };

  data.append('user_id', localStorage.user_id);
  xhr.send(data);  
}





//////////////////////
// Language support //
//////////////////////

/**
 * Checks if a given language is supported.
 * @param  {String}   lang     
 * @param  {Function} callback 
 * @return {undefined}            
 */
function checkLanguagesSupport(lang, callback){
  
  // check if we've got cached this language support to avoid making request
  var languagesSupport_cache_key = 'languagesSupport_' + lang;
  var languagesSupport           = jsCache.get(languagesSupport_cache_key, null);
  var xhr;

  if (languagesSupport !== null) {
    callback(languagesSupport);
    return; 
  }
  
  // not cached, make request
  xhr = new XMLHttpRequest();
  xhr.open('GET', TGD_API + "api/languagesSupport/" + lang, true);
  xhr.onload = function () {
        
    var resp;

    if ( xhr.status == 200)  {
      resp = JSON.parse(xhr.responseText);
      callback(resp);
      
      // now save results to cache for 1h
      jsCache.set(languagesSupport_cache_key, resp, 3600);
    }
        
  };

  xhr.send();  
}





/////////////////
// Contributed //
/////////////////

/**
 * Load percentile data for current user.
 * @param {Function} callback What to do with the data obtained.
 * @return {undefined} 
 */
function loadContributed(callback){
  var xhr;
  var value = (localStorage.member_id != "0")? localStorage.member_id : localStorage.user_id;
  var resp;

  xhr = new XMLHttpRequest();
  xhr.open('GET', TGD_API + "api/queries/percentile/" + value, true);
  xhr.onload = function () {
  
    if ( xhr.status == 200)  {
      resp = xhr.responseText;
      localStorage.contributed = resp;
  
      try{
        resp = JSON.parse(xhr.responseText);
      }catch(e){
        resp = {};
      }

      // The call from background.js doesn't pass any callback.
      if (typeof(callback != "undefined")){
        callback(resp);
      }
    } 
  };

  xhr.send();
}





///////////
// Loans //
///////////

/**
 * Load data regarding the loans.
 * @param  {Function} callback 
 * @return {undefined}            
 */
function loadLoans(callback){

  var xhr = new XMLHttpRequest();
  xhr.open('GET', TGD_API+"api/loans/count", true);
  xhr.onload = function () {
    var resp;

    if ( xhr.status == 200)  {
      resp = JSON.parse(xhr.responseText);
      callback(resp);
    }
  };

  xhr.send();
}





//////////////
// Browsing //
//////////////

/**
 * Saves the page visited via API.
 * @param {String} browsing 
 */
function saveBrowsing(browsing){
  var data = new FormData();
  var xhr;

  xhr = new XMLHttpRequest();
  xhr.open('POST', TGD_API + "api/browsing", true);
  xhr.onload = function () {
    var resp;
    
    if ( xhr.status == 200)  {
      resp = JSON.parse(xhr.responseText);
    }
  };

  data.append('member_id', browsing.member_id);
  data.append('user_id', browsing.user_id);
  data.append('domain', browsing.domain);
  data.append('url', browsing.url);
  data.append('usertime', browsing.usertime);
  xhr.send(data);
}





///////////////////
// User settings //
///////////////////

/**
 * Saves user settings to API.
 */
function saveUserSettingsToAPI() {

  var data = new FormData();
  var keys = saveUserSettings_getKeys();
  var xhr;

  for (var key in keys) {
    if (keys.hasOwnProperty(key)) {
      if (typeof(localStorage[key])!='undefined') {
        data.append(key, localStorage[key]);
      }
    }
  }
  
  xhr = new XMLHttpRequest();
  xhr.open('POST', TGD_API+"api/saveUserSettings", true);
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
  var keys = saveUserSettings_getKeys();
  var value;
  var type;

  for (var key in keys) {
    if (keys.hasOwnProperty(key)) {
      if (settings[key]) {
        value = settings[key];
        type  = keys[key];
        switch (type) {
          case 'bool':
            value = castBool(value);
            break;
          case 'int':
            value = parseInt(value, 10);
            break;
          case 'text':
            value = String(value);
            break;
          default:
            break;
        }
        localStorage[key]=value;
      }
    }
  }
}





/////////////
// Logging //
/////////////

function log_if_enabled(msg, category) {
  if (DEBUG) {
      if (category && log_categories[category] === false) {
          return;
      }
      console.log(msg);
  }
}