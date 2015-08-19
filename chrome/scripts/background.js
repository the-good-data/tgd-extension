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
 * Adtracks captured for each tab.
 * @type {Object}
 */
 var ADTRACKS          = {};
 
 /**
 * Stores the counters for each tab.
 * @type {Object}
 */
 var BADGE_COUNTER     = {};
 
 /**
 * The WHITELISTed services.
 * @type {Object}
 */
 var WHITELIST         = deserialize(localStorage.whitelist) || {};
 
 /**
 * Last search query run.
 * @type {String}
 */
 var LAST_SEARCH_QUERY = '';
 
 /**
 * The content key.
 * @type {String}
 */
 var CONTENT_NAME      = 'Content';
 
 /**
 * The social key.
 * @type {String}
 */
 var SOCIAL_NAME       = 'Social';





//////////
// APIs //
//////////

/**
 * The "browserAction" API.
 * @type {Object}
 */
 var BROWSER_ACTION_API = chrome.browserAction;
 
 /**
 * The "tabs" API.
 * @type {Object}
 */
 var TABS_API           = chrome.tabs;
 
 /**
 * The "cookies" API.
 * @type {Object}
 */
 var COOKIES_API        = chrome.cookies; 

//////////////
// Services //
//////////////

var SOCIAL_SERVICES  = ['Facebook','Twitter']; // TODO: Unused
var TRADING_SERVICES = ['Doubleclick','Chango','Pubmatic','adxhm','eBay','Fox One Stop Media','Federated Media','eXelate','Casale Media','LiveIntent','Improve Digital','Criteo','Rapleaf','AudienceManager','OpenX','AOL','AddThis','AppNexus','LiveRail','BrightRoll','Skimlinks','SpotXchange','adBrite','CONTEXTWEB','rmxregateKnowledge','Adap.tv'];
var SEARCHS_DOMAINS  = ['google.com','bing.com','yahoo.com']; // TODO: Unused





//////////
// Tabs //
//////////

/**
 * The domain name of the tabs.
 * @type {Object}
 */
 var TABS_DOMAINS           = {};
 
 /**
 * The previous requested URL of the tabs.
 * @type {Object}
 */
 var TABS_PREVIOUS_REQUESTS = {};
 
 /**
 * The previous redirected URL of the tabs.
 * @type {Object}
 */
 var TABS_REDIRECTS         = {};





//////////////
// Sitename //
//////////////
 
/**
 *  The Sitename object.
 * @type {Sitename}
 */
var SITENAME                = new Sitename;

/**
 * The Sitename initialization status.
 * @type {Boolean} 
 */
var SITENAME_IS_INITIALIZED = SITENAME.isInitialized;

/**
 * Gets the domain portion for a given URL.
 * @type {String}
 */
var SITENAME_GET_DOMAIN     = SITENAME.get;





///////////////
// Functions //
///////////////

/**
 * Create a whitelist with the new format from the old format if it exists.
 * @return {undefined} 
 */
function migrateWhitelist() {
  var isLegacy      = typeof(WHITELIST.version) == "undefined";
  var new_whitelist = {version : 2, all_threats_allowed: {}};
  var domain, category;

  // if the whitelist has old format
  if (isLegacy) {
    // loop through each domain
    for(domain in WHITELIST) {
      // loop through each category of current domain
      for(category in WHITELIST[domain]) {
        
        // if threats are allowed, store domain name.
        if (category == "*:*" || category == "*") {
          new_whitelist.all_threats_allowed[domain] = WHITELIST[domain][category];
        } 

        // if it's an specific category, store it.
        else {
          if (WHITELIST[domain][category] === true || category == CONTENT_NAME) {
            new_whitelist[category] = WHITELIST[domain][category];
          }
        }
      }
    }

    localStorage.old_whitelist = JSON.stringify(WHITELIST); // TODO: remove after testing
    localStorage.whitelist     = JSON.stringify(new_whitelist);
  }
}

/**
 * Initializes the badge and pop-up.
 * @return {undefined} 
 */
function initializeToolbar() {
  BROWSER_ACTION_API.setBadgeBackgroundColor({color: [85, 144, 210, 255]});
  BROWSER_ACTION_API.setPopup({popup: '/markup/popup.html'});
}

/**
 * Indicates in the badge the number of tracking requests.
 * @param  {Number} tab_id      The tab id.
 * @param  {Number} count       The amount to display in the badge.
 */
function updateCounter(tab_id, count) {
  
  BROWSER_ACTION_API.setBadgeBackgroundColor({
    tabId: tab_id, 
    color: [136, 136, 136, 255]
  });
  
  BROWSER_ACTION_API.setBadgeText({
    tabId: tab_id, 
    text: (count || '') + ''
  });
}

/**
 * Checks that the given tab id exists and then updates the counter.
 * @param  {Number} tab_id      The tab id.
 * @param  {Number} count       The amount to display in the badge.
 */
function safelyUpdateCounter(tab_id, count) {
  TABS_API.query({}, function(tabs) {
    var tab_count = tabs.length;

    for (var i = 0; i < tab_count; i++) {
      if (tab_id == tabs[i].id) {
        updateCounter(tab_id, count);
        break;
      }
    }
  });
}

/**
 * Increments the number of tracking requests.
 * @param  {Number} tab_id       The ID of the tab to be incremented.
 */
function incrementCounter(tab_id) {

  if (typeof(BADGE_COUNTER[tab_id]) == "undefined"){
    BADGE_COUNTER[tab_id] = 0;
  }

  BADGE_COUNTER[tab_id] += 1;
  safelyUpdateCounter(tab_id, BADGE_COUNTER[tab_id]);
}

/**
 * Look for query string in a given URL.
 * @param  {String} requested_url Requested URL.
 */
function lookforQuery(requested_url) {

  var child_domain = SITENAME_GET_DOMAIN(requested_url);
  var is_google     = (child_domain.search("google.") > -1);
  var is_gmail      = (child_domain.search("mail.google.") > -1);
  var is_bing       = (child_domain.search("bing.") > -1);
  var is_yahoo      = (child_domain.search("yahoo.") > -1);   

  // Search proxied
  var isOmniboxSearch = true;
  var isSearchByPage = new RegExp("search_plus_one=form").test(requested_url);
  var isSearchByPopUp = new RegExp("search_plus_one=popup").test(requested_url);

  var isProxied =true;

  // Google
  var isChromeInstant = ( is_google && (requested_url.search("chrome-instant") > -1) );
  var is_google_OMB_search = ( is_google && (requested_url.search("/complete/") > -1) );
  var is_google_site_search = ( is_google && ( (requested_url.search("#q=") > -1) || (requested_url.search("suggest=") > -1) || (requested_url.search("output=search") > -1) || (requested_url.search("/s?") > -1)) );
  // Bing
  var is_bing_OMB_search = ( is_bing && (requested_url.search("osjson.aspx") > -1) );
  var is_bing_site_search = ( is_bing && (requested_url.search("search?") > -1) );
  // Yahoo!
  var is_yahooSearch = ( is_yahoo && (requested_url.search("search.yahoo") > -1) );

  if ( isProxied && (isChromeInstant || is_google_OMB_search || is_google_site_search || is_bing_site_search || is_bing_OMB_search || is_yahooSearch) ) {
    if (is_google_site_search && !is_gmail){
      extractSearch('google',requested_url);
    } 
    else  if (is_yahooSearch){
      extractSearch('yahoo',requested_url);
    }
    else  if (is_bing_site_search){
      extractSearch('bing',requested_url);
    }
  }
}

/**
 * Extract the search terms from the URL string and save it.
 * @param  {String} search_engine_name Search engine name.
 * @param  {String} requested_url    Requested URL.
 */
function extractSearch(search_engine_name, requested_url) {
    
  var data;
  var search_term = "";
  var language;
  var localtime;

  data = getDataFromQuery(requested_url, search_engine_name);
  if (typeof(data) != "undefined" && typeof(data.q) != "undefined" ) {

    seach_term = data.q; 
    if (LAST_SEARCH_QUERY == seach_term || typeof(seach_term) == "undefined" || seach_term.length === 0) {
      return;
    }

    //    language="en"; // force language for testing purpose, comment this out
    language = window.navigator.userLanguage || window.navigator.language;
    checkLanguagesSupport(language, function (language_support){
      
      var lang_support;
      var lang_alias = (language_support !== null) ? language_support.alias : language;

      checkQuery(seach_term, lang_alias, function(data_queries){
        
        var share = 'false';
        var user_id;
        var query;

        if (data_queries.length === 0){
          
          //set last query search 
          LAST_SEARCH_QUERY = seach_term;

          lang_support = (language_support) !== null ? language_support.support : false;
          if (lang_support === true) {
            //Check if user has selected not to share info with our partner
            if (castBool(localStorage.share_search) === true && feature_trade_sensitive_queries) {
              share = "true";
            } else {
              share = "false";
            }
          } 
          
          user_id = localStorage.user_id;
          if (localStorage.member_id != "0") {
            user_id = "";
          }

          //set localtime
          localtime = new Date();
          localtime.setHours(localtime.getHours() + localtime.getTimezoneOffset() / 60);
          if ( castBool(localStorage.store_navigation) ) {
            query = {
                "member_id":localStorage.member_id,
                "user_id": user_id,
                "provider":search_engine_name,
                "query":requested_url,
                "data":seach_term,
                "lang":language,
                "language_support":lang_support,
                "share":share,
                "usertime": localtime.format("yyyy-mm-dd HH:MM:ss")
            };
          } else {
            query = {
                "member_id":0,
                "user_id": "",
                "provider":"",
                "query":"",
                "data":"",
                "lang":"",
                "language_support":"",
                "share":share,
                "usertime": localtime.format("yyyy-mm-dd")
            };
          }

          SaveQuery(query);
        } 
      });
    });
  }
}





////////////////////
// event handlers //
////////////////////

/**
 * Fired when a request is about to occur. (developer.chrome.com)
 * Traps and selectively cancels or redirects a request.
 * @param  {Function}   Callback that is exected when this event is triggered.
 */
chrome.webRequest.onBeforeRequest.addListener(function(details) {
  

  var tab_id        = details.tabId;
  var requested_url = details.url;

  var child_domain  = SITENAME_GET_DOMAIN(requested_url);
  var child_service = getService(child_domain);
  var child_name;
  
  var is_redirect_safe;
  var type = details.type;
  var is_parent                       = type == 'main_frame';
  if (is_parent) TABS_DOMAINS[tab_id] = child_domain;
  
  var parent_domain;
  var parent_service;
  
  var hardened_url;
  var is_hardened;

  var blockingResponse     = {cancel: false};
  var is_whitelisted;
  var adtrack_status_extra = {};


  var allow_social;
  var whitelist_item_status;

  var localtime;
  var status;
  var user_id;

  if (child_service) {
    // Set up our provider    
    parent_domain         = TABS_DOMAINS[tab_id];
    parent_service        = getService(parent_domain);
    // parent_name           = (parent_service)? parent_service.name : "";

    child_name            = child_service.name;

    is_redirect_safe      = requested_url != TABS_PREVIOUS_REQUESTS[tab_id];
    allow_social          = castBool(localStorage.allow_social);
    
    whitelist_item_status = (deserialize(localStorage.whitelist) || {})[child_name + ':' + child_service.category];

    // The request is allowed: the topmost frame has the same origin.
    if (is_parent || !parent_domain || child_domain == parent_domain || parent_service && child_name == parent_service.name) { 
      if (is_redirect_safe) {
        hardened_url = harden(requested_url);
        is_hardened  = hardened_url.hardened;
        hardened_url = hardened_url.url;
        if (is_hardened) {
          blockingResponse = {redirectUrl: hardened_url};
        }
      }
    }

    // Threats alowed in current site
    else if (getAllowThreatsInCurrent(parent_domain)) {
      hardened_url = harden(requested_url);
      is_hardened  = hardened_url.hardened;
      hardened_url = hardened_url.url;
      is_whitelisted = true; 
      if (is_hardened) {
        blockingResponse = {redirectUrl: hardened_url};
      }
    }

    // Trading services
    else if (castBool(localStorage.share_search) && feature_trade_sensitive_queries  && contains(TRADING_SERVICES, child_name) && typeof(whitelist_item_status) != "undefined") {
      adtrack_status_extra.status_text  = 'TRADING';
      adtrack_status_extra.button_style = 'background-color: #FCC34A';
      adtrack_status_extra.button_title = child_name + ' is automatically allowed for trading.';            
      is_whitelisted = true;
    }

    // Content, allowed by default, must be set to false explicitly inorder to be blocked
    else if (child_service.category == CONTENT_NAME &&  whitelist_item_status !== false) {
      adtrack_status_extra.button_title = child_name + ' is automatically allowed for trading.';
      is_whitelisted = true;
    }

    // Service is in Social list, and Allow Social button is ON but check whitelisted status
    else if (child_service.category == SOCIAL_NAME && allow_social  && typeof(whitelist_item_status) != "undefined" ) {
      is_whitelisted = true;
    }

    // The request is allowed: the service is whitelisted.
    else if (whitelist_item_status) { 
      if (is_redirect_safe) {
        hardened_url = harden(requested_url);
        is_hardened  = hardened_url.hardened;
        hardened_url = hardened_url.url;
        if (is_hardened) {
          blockingResponse = {redirectUrl: hardened_url};
        } else {
          is_whitelisted = true;
        }
      }      
    } else {
      blockingResponse = { redirectUrl: type == 'image' ? 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==' : 'about:blank'}; // The request is denied.
    }
      
    

    if (blockingResponse.redirectUrl || is_whitelisted) {


      status ='blocked';
      if (is_whitelisted === true) {
        status = 'allowed';
      }

      user_id = localStorage.user_id;
      if (localStorage.member_id != "0") {
        user_id = "";
      }

      //set localtime
      localtime = new Date();
      localtime.setHours(localtime.getHours() + localtime.getTimezoneOffset() / 60);

      var adtrack = {
        'member_id':localStorage.member_id,
        'user_id': user_id,
        'category':child_service.category,
        'service_name':child_name,
        'service_url':child_service.url,
        'domain':parent_domain,
        'url':details.url,
        'usertime': localtime.format("yyyy-mm-dd HH:MM:ss"),
        'status':status,
        'status_extra': adtrack_status_extra
      };

      saveThreat(adtrack);

      if (typeof(ADTRACKS[tab_id]) == "undefined"){
        ADTRACKS[tab_id]= [];
      }

      ADTRACKS[tab_id].push(adtrack);
      incrementCounter(tab_id, child_service);
    } 
  } 

  (requested_url != TABS_REDIRECTS[tab_id]) && delete TABS_PREVIOUS_REQUESTS[tab_id];
  delete TABS_REDIRECTS[tab_id];

  if (is_hardened) {
    TABS_PREVIOUS_REQUESTS[tab_id] = requested_url;
    TABS_REDIRECTS[tab_id]         = hardened_url;
  }

  return blockingResponse;
}, {urls: ['http://*/*', 'https://*/*']}, ['blocking']);

/**
 * Fired when the extension is first installed, when the extension is updated to 
 * a new version, and when Chrome is updated to a new version (developer.chrome.com)
 * @param  {Function}   Callback that is exected when this event is triggered.
 */
chrome.runtime.onInstalled.addListener(function(details){
  // so we can get user from webapp after it has been installed
  getLoggedUser(function () {}, function () {});
});

/**
 * Fired when a tab is updated. (developer.chrome.com)
 * @param  {Function}   Callback that is exected when this event is triggered.
 */
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    var localtime;
    var child_domain;
    var user_id;
    var history;

    var url_parts;
    var url_to_log;

    if ( changeInfo.status == "complete" ){
      
      loadAchievements(checkUnreadAchievements);
      getLoggedUser(function () {}, function () {});
      
      // Skip ignored urls
      if (!(/^http(s)?:\/\//.test(tab.url))) {
        return;
      }

      lookforQuery(tab.url);

      user_id = localStorage.user_id;
      if (localStorage.member_id != "0"){
        user_id = "";
      }

      child_domain = SITENAME_GET_DOMAIN(tab.url);
      url_parts    = parseUri(tab.url);
      url_to_log   = url_parts.protocol + '://' + url_parts.host + '/';
      localtime    = new Date();
      // Store navigation only if store_navigation param is enabled
      if ( castBool(localStorage.store_navigation) ) {
        history = {
          'member_id':localStorage.member_id,
          'user_id'  : user_id,
          'domain'   :child_domain,
          'url'      : url_to_log, // disabled sending the original url, now sending only '/' (issue #14)
          'usertime' : localtime.format("yyyy-mm-dd HH:MM:ss")
        };
      } else {
        history = {
          'member_id': 0,
          'user_id'  : '',
          'domain'   : '',
          'url'      : '', // disabled sending the original url, now sending only '/' (issue #14)
          'usertime' : localtime.format("yyyy-mm-dd")
        };
      }

      saveBrowsing(history);
    }
});

/**
 * Fired when a navigation is committed. The document might still be 
 * downloading, but at least part of the document has been received from the 
 * server and the browser has decided to switch to the new document. (developer.chrome.com)
 * Resets the number of tracking requests for a tab.
 * @param  {Function}   Callback that is exected when this event is triggered. 
 */
chrome.webNavigation.onCommitted.addListener(function(details) {
  var tab_id = details.tabId;

  if (!details.frameId) {
    delete ADTRACKS[tab_id];
    delete BADGE_COUNTER[tab_id];
    safelyUpdateCounter(tab_id, 0);
  }
});

/**
 * Fired when a message is received from other component of the extension.
 * @param  {Function}   Callback that is exected when this event is triggered.
 */
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if(typeof(request.newIconPath != "undefined")){
    chrome.browserAction.setIcon({
      path: request.newIconPath
    });
  }
});





///////////
// begin //
///////////

migrateWhitelist();
initializeToolbar();
loadContributed(function(json){localStorage.contributed = JSON.stringify(json);});

if (typeof(localStorage.user_id) == "undefined"){
  localStorage.user_id          = createUUID();
  localStorage.share_search     = option_default_trade_sensitive_queries;
  localStorage.store_navigation = option_default_store_navigation;
  localStorage.allow_social     = false;
  localStorage.ask_confirmation = true;
}

if (typeof(localStorage.member_id) == "undefined"){
  localStorage.member_id        = 0;
  localStorage.member_username  ='';
  localStorage.share_search     = option_default_trade_sensitive_queries;
  localStorage.store_navigation = option_default_store_navigation;
  localStorage.allow_social     = false;
  localStorage.ask_confirmation = true;
}

/* Prepopulates the store of tab domain names. */
var id = setInterval(function() {
  var tlds;
  var tab_count;
  var tab;

  if (SITENAME_IS_INITIALIZED()) {
    clearInterval(id);
    tlds               = deserialize(localStorage.tlds);
    tlds["google.com"] = true;
    tlds["yahoo.com"]  = true;
    localStorage.tlds  = JSON.stringify(tlds);

    TABS_API.query({}, function(tabs) {
      tab_count = tabs.length;

      for (var i = 0; i < tab_count; i++) {
        tab = tabs[i];
        TABS_DOMAINS[tab.id] = SITENAME_GET_DOMAIN(tab.url);
      }
    });
   }
}, 100);


