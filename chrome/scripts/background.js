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

/* Toggles the search preferences. */
function editSettings(state) {
  state = !!state;
  INSTANT_ENABLED.set({value: state});
  SUGGEST_ENABLED.set({value: state});
}



/* Preps the browser action. */
function initializeToolbar() {
  BROWSER_ACTION.setBadgeBackgroundColor({color: [85, 144, 210, 255]});
  const DETAILS = {popup: (SAFARI ? 'chrome' : '') + '/markup/popup.html'};

  if (SAFARI) {
    DETAILS.width = 148;
    DETAILS.height = 210;
  }

  BROWSER_ACTION.setPopup(DETAILS);
}

/* Tallies the number of tracking requests. */
function getCount(tabRequests) {
  var count = 0;

  for (var categoryName in tabRequests) {
    if (categoryName == CONTENT_NAME) continue;
    var category = tabRequests[categoryName];
    for (var serviceName in category) count += category[serviceName].count;
  }

  return count;
}

/* Indicates the number of tracking requests. */
function updateCounter(tabId, count, deactivated) {
  
  // if (
  //   deserialize(localStorage.blockingIndicated) &&
  //       deserialize(localStorage.blogOpened)
  // ) {
  
//    deactivated && BROWSER_ACTION.setBadgeBackgroundColor({
//      tabId: tabId, color: [136, 136, 136, 255]
//    });
  
    BROWSER_ACTION.setBadgeBackgroundColor({
      tabId: tabId, color: [136, 136, 136, 255]
    });
  
  BROWSER_ACTION.setBadgeText({tabId: tabId, text: (count || '') + ''});
  // }
}

/* Indicates the number of tracking requests, if the tab is rendered. */
function safelyUpdateCounter(tabId, count, deactivated) {
  TABS.query({}, function(tabs) {
    const TAB_COUNT = tabs.length;

    for (var i = 0; i < TAB_COUNT; i++) {
      if (tabId == tabs[i].id) {
        updateCounter(tabId, count, deactivated);
        break;
      }
    }
  });
}

/* Tallies and indicates the number of tracking requests. */
function incrementCounter(tabId, service, blocked) {
//  const TAB_REQUESTS = REQUEST_COUNTS[tabId] || (REQUEST_COUNTS[tabId] = {});
//  const CATEGORY = service.category;
//  const CATEGORY_REQUESTS =
//      TAB_REQUESTS[CATEGORY] || (TAB_REQUESTS[CATEGORY] = {});
//  const SERVICE = service.name;
//  const SERVICE_REQUESTS =
//      CATEGORY_REQUESTS[SERVICE] ||
//          (CATEGORY_REQUESTS[SERVICE] = {url: service.url, count: 0});
//  SERVICE_REQUESTS.count++;

  if (ADTRACKS_BADGE_COUNTER[tabId] == undefined){
    ADTRACKS_BADGE_COUNTER[tabId]= 0;
  }
  ADTRACKS_BADGE_COUNTER[tabId]++;

  safelyUpdateCounter(tabId, ADTRACKS_BADGE_COUNTER[tabId], !blocked);
}

const SOCIAL_SERVICES = ['Facebook','Twitter'];
const TRADED_SERVICES = ['Doubleclick','Chango','Pubmatic','adxhm','eBay','Fox One Stop Media','Federated Media','eXelate','Casale Media','LiveIntent','Improve Digital','Criteo','Rapleaf','AudienceManager','OpenX','AOL','AddThis','AppNexus','LiveRail','BrightRoll','Skimlinks','SpotXchange','adBrite','CONTEXTWEB','rmxregateKnowledge','Adap.tv'];
const SEARCHS_DOMAINS = ['google.com','bing.com','yahoo.com'];

const ADTRACKS = {};
const ADTRACKS_BADGE_COUNTER = {};

/* The current build number. */
const CURRENT_BUILD = 42;

/* The previous build number. */
const PREVIOUS_BUILD = localStorage.build;

/* The domain name of the tabs. */
const DOMAINS = {};

/* The WHITELISTed services per domain name. */
const WHITELIST = deserialize(localStorage.whitelist) || {};

/* The previous requested URL of the tabs. */
const REQUESTS = {};

/* The previous redirected URL of the tabs. */
const REDIRECTS = {};

/* The number of tracking requests per tab, overall and by third party. */
const REQUEST_COUNTS = {};

/* The content key. */
const CONTENT_NAME = 'Content';

/* The content key. */
const SOCIAL_NAME = 'Social';

/* The "tabs" API. */
const TABS = chrome.tabs;

/* The "privacy" API. */
if (false) const PRIVACY = chrome.privacy.services;

/* The "cookies" API. */
const COOKIES = chrome.cookies;

/* The "browserAction" API. */
const BROWSER_ACTION = chrome.browserAction;

/* The "instantEnabled" property. */
if (false) const INSTANT_ENABLED = PRIVACY.instantEnabled;

/* The "searchSuggestEnabled" property. */
if (false) const SUGGEST_ENABLED = PRIVACY.searchSuggestEnabled;

/* The experimental value of the "levelOfControl" property. */
const EDITABLE = 'controllable_by_this_extension';

/* The domain object. */
const SITENAME = new Sitename;

/* The domain initialization. */
const IS_INITIALIZED = SITENAME.isInitialized;

/* The domain getter. */
const GET = SITENAME.get;

/* Last query search */
var lastQuerySearch='';

initializeToolbar();

/* Prepopulates the store of tab domain names. */
const ID = setInterval(function() {
  if (IS_INITIALIZED()) {
    clearInterval(ID);
    const TLDS = deserialize(localStorage.tlds);
    TLDS['google.com'] = true;
    TLDS['yahoo.com'] = true;
    localStorage.tlds = JSON.stringify(TLDS);

    TABS.query({}, function(tabs) {
      const TAB_COUNT = tabs.length;

      for (var i = 0; i < TAB_COUNT; i++) {
        var tab = tabs[i];
        DOMAINS[tab.id] = GET(tab.url);
      }
    });
  }
}, 100);

/* Tests the writability of the search preferences. */
false && INSTANT_ENABLED.get({}, function(details) {
  details.levelOfControl == EDITABLE &&
      SUGGEST_ENABLED.get({}, function(details) {
        if (details.levelOfControl == EDITABLE)
            localStorage.settingsEditable = true;
        deserialize(localStorage.settingsEditable) &&
            deserialize(localStorage.searchHardened) && editSettings();
      });
});

function log_if_enabled(msg, category) {
  if (DEBUG) {
      if (category && log_categories[category] === false) {
          return;
      }
      console.log(msg);
  }
}

/* Traps and selectively cancels or redirects a request. */
chrome.webRequest.onBeforeRequest.addListener(function(details) {
  
  const TYPE = details.type;
  const PARENT = TYPE == 'main_frame';
  const TAB_ID = details.tabId;
  const REQUESTED_URL = details.url;
  const CHILD_DOMAIN = GET(REQUESTED_URL);
  
  if (PARENT) DOMAINS[TAB_ID] = CHILD_DOMAIN;
  var childService = getService(CHILD_DOMAIN);
  var hardenedUrl;
  var hardened;
  var blockingResponse = {cancel: false};
  var whitelisted;
  var adtrack_status_extra={};

  if (childService) {
    
    log_if_enabled("", "adtrack");
    log_if_enabled("===================== INTERCEPTING REQUEST =====================", "adtrack");
    log_if_enabled("Share search: "+castBool(localStorage.share_search), "adtrack");
    log_if_enabled(REQUESTED_URL, "adtrack");
    
    // Set up our provider    
    const PARENT_DOMAIN = DOMAINS[TAB_ID];
    const PARENT_SERVICE = getService(PARENT_DOMAIN);
    const CHILD_NAME = childService.name;
    const REDIRECT_SAFE = REQUESTED_URL != REQUESTS[TAB_ID];
    
    log_if_enabled("Parent [Domain: "+PARENT_DOMAIN+"] "+(PARENT_SERVICE?"category: "+PARENT_SERVICE.category+" name: "+PARENT_SERVICE.name+" url: "+PARENT_SERVICE.url+ "]":" - unknown parent service"), "adtrack");
    log_if_enabled("Child [Domain: "+CHILD_DOMAIN+" category: "+childService.category+" name: "+childService.name+" url: "+childService.url+ "]", "adtrack");

    var allow_social = castBool(localStorage.allow_social);
    
    var item_whitelist_status=((deserialize(localStorage.whitelist) || {})[PARENT_DOMAIN] || {})[CHILD_NAME+':'+childService.category];
    
    
    
    // The request is allowed: the topmost frame has the same origin.
    if (
      PARENT || !PARENT_DOMAIN || CHILD_DOMAIN == PARENT_DOMAIN ||
          PARENT_SERVICE && CHILD_NAME == PARENT_SERVICE.name 
    ) { 
      if (REDIRECT_SAFE) {
        hardenedUrl = harden(REQUESTED_URL);
        hardened = hardenedUrl.hardened;
        hardenedUrl = hardenedUrl.url;
        if (hardened) blockingResponse = {redirectUrl: hardenedUrl};
      }
      log_if_enabled("BLOCK F", "adtrack");
      
    }
    
    // Trading services
    else if (( (castBool(localStorage.share_search) && contains(TRADED_SERVICES,childService.name)) ) && (item_whitelist_status==undefined||item_whitelist_status))
    {
      
      log_if_enabled("BLOCK TRADING", "adtrack");
      whitelisted = true;
      
      log_if_enabled(item_whitelist_status, "adtrack");
      
      adtrack_status_extra.statusText='TRADING';
      adtrack_status_extra.buttonStyle='background-color: #FCC34A';
      adtrack_status_extra.buttonTitle=childService.name+' is automatically allowed for trading.';
            
    }
    
    // Content, allowed by default
    else if (childService.category==CONTENT_NAME && (item_whitelist_status==undefined||item_whitelist_status))
    {
      
      log_if_enabled("BLOCK CONTENT", "adtrack");
      whitelisted = true;
      
      log_if_enabled(item_whitelist_status, "adtrack");
      
      adtrack_status_extra.buttonTitle=childService.name+' is automatically allowed for trading.';
      
    }
    
    // Service is in Social list, and Allow Social button is ON but check whitelisted status
    else if (childService.category==SOCIAL_NAME && allow_social  && (item_whitelist_status==undefined||item_whitelist_status))
    {
      log_if_enabled("BLOCK E", "adtrack");
      whitelisted = true;
    }
    
    // The request is allowed: the service is whitelisted.
    else if ((
      (deserialize(localStorage.whitelist) || {})[PARENT_DOMAIN] || {}
    )[CHILD_NAME+':'+childService.category]) { 
      log_if_enabled("BLOCK G", "adtrack");
      if (REDIRECT_SAFE) {
        hardenedUrl = harden(REQUESTED_URL);
        hardened = hardenedUrl.hardened;
        hardenedUrl = hardenedUrl.url;
        log_if_enabled("hardened url: "+hardenedUrl, "adtrack");
        if (hardened) {
          blockingResponse = {redirectUrl: hardenedUrl};
          log_if_enabled("BLOCK G-HARDENED", "adtrack");
        } else {
          whitelisted = true;
          log_if_enabled("BLOCK G-WHITELISTED", "adtrack");
        }
      }
      
    } 
    else 
    {
      log_if_enabled("BLOCK H", "adtrack");
      
      
      // Deactivated tab
      if (isDeactivateCurrent(PARENT_DOMAIN,TAB_ID))
      {
        log_if_enabled("BLOCK H-A", "adtrack");
        whitelisted = true; 

        hardenedUrl = harden(REQUESTED_URL);
        hardened = hardenedUrl.hardened;
        hardenedUrl = hardenedUrl.url;
        if (hardened) 
          blockingResponse = {redirectUrl: hardenedUrl};
        else 
          whitelisted = true; 
      }
      else
      {
        
        log_if_enabled("BLOCK H-B", "adtrack");

        blockingResponse = {
          redirectUrl:
            TYPE == 'image' ?
                'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg=='
                    : 'about:blank'
        }; // The request is denied.
      }
      
    }

    if (blockingResponse.redirectUrl || whitelisted) {

      log_if_enabled("blockingResponse.redirectUrl || whitelisted", "adtrack");

      var localtime = new Date();
      var status='blocked';
      var user_id = localStorage.user_id;

      if (whitelisted == true)
        status = 'allowed';

      //Hack change category form disconnect
      if ( childService.category == 'Disconnect')
        childService.category='Others';

      //delete instance extension
      if (localStorage.member_id!=0)
        user_id="";

      //set localtime
      localtime.setHours(localtime.getHours() + localtime.getTimezoneOffset() / 60);

      var adtrack = {
        'member_id':localStorage.member_id,
        'user_id': user_id,
        'category':childService.category,
        'service_name':childService.name,
        'service_url':childService.url,
        'domain':PARENT_DOMAIN,
        'url':details.url,
        'usertime': localtime.format("yyyy-mm-dd HH:MM:ss"),
        'status':status,
        'status_extra': adtrack_status_extra
      };

        log_if_enabled('ADTRACK DETECTADA', "adtrack");
        log_if_enabled('===========================', "adtrack");
        log_if_enabled(adtrack, "adtrack");
        log_if_enabled('===========================', "adtrack");
        log_if_enabled('', "adtrack")
      
      SaveThreat(adtrack);

      if (ADTRACKS[TAB_ID] == undefined){
        ADTRACKS[TAB_ID]= [];
      }

      ADTRACKS[TAB_ID].push(adtrack);
      incrementCounter(TAB_ID, childService, !whitelisted);
      
    }
    
  } else {
//    log_if_enabled("No Child Service detected. Requested Url: "+REQUESTED_URL, "adtrack");
  }

  REQUESTED_URL != REDIRECTS[TAB_ID] && delete REQUESTS[TAB_ID];
  delete REDIRECTS[TAB_ID];

  if (hardened) {
    REQUESTS[TAB_ID] = REQUESTED_URL;
    REDIRECTS[TAB_ID] = hardenedUrl;
  }

  return blockingResponse;
}, {urls: ['http://*/*', 'https://*/*']}, ['blocking']);

function lookforQuery(REQUESTED_URL)
{

  const CHILD_DOMAIN = GET(REQUESTED_URL);
  //const PROXY_REDIRECT_BY_PRESETTING = "https://" + bgPlusOne.C_PROXY_PRESETTING;
  //const PROXY_REDIRECT = "https://" + bgPlusOne.C_PROXY_SEARCH + "/search";
  const REGEX_URL = /[?|&]q=(.+?)(&|$)/;
  const REGEX_URL_YAHOO = /[?|&]p=(.+?)(&|$)/;
  //const TYPE = details.type;
  // const T_MAIN_FRAME = (TYPE == 'main_frame');
  // const T_XMLHTTPREQUEST = (TYPE == 'xmlhttprequest');
  //var REQUESTED_URL = details.url;
  //const CHILD_DOMAIN = getHostname(REQUESTED_URL);

  //var blockingResponse = {cancel: false};
  var blocking = presetting = false;

  
  var isGoogle = (CHILD_DOMAIN.search("google.") > -1);
  var isBing = (CHILD_DOMAIN.search("bing.") > -1);
  var isYahoo = (CHILD_DOMAIN.search("yahoo.") > -1);
  var isBlekko = (CHILD_DOMAIN.search("blekko.") > -1);
  var isDisconnectSite = (CHILD_DOMAIN.search("disconnect.me") > -1);
  var isDuckDuckGo = (CHILD_DOMAIN.search("duckduckgo.") > -1);
  var hasSearch = (REQUESTED_URL.search("/search") > -1);
  var hasMaps = (REQUESTED_URL.search("/maps") > -1);
  var hasWsOrApi = (REQUESTED_URL.search("/ws") > -1) || (REQUESTED_URL.search("/api") > -1);
  var hasGoogleImgApi = (REQUESTED_URL.search("tbm=isch") > -1);
  //var isDisconnect = bgPlusOne.isProxySearchUrl(REQUESTED_URL);
  var isDisconnect = false
  var isDisconnectSearchPage = (REQUESTED_URL.search("search.disconnect.me/stylesheets/injected.css") > -1);
   

  // Search proxied
  var modeSettings = deserialize(localStorage['mode_settings']);
  //var isSecureMode = (deserialize(localStorage['secure_search']) == true);
  //var isOmniboxSearch = (bgPlusOne.page_focus == false);
  var isOmniboxSearch = true;
  var isSearchByPage = new RegExp("search_plus_one=form").test(REQUESTED_URL);
  var isSearchByPopUp = new RegExp("search_plus_one=popup").test(REQUESTED_URL);
  var isProxied = ( 
    (modeSettings == 0 && isSearchByPopUp) ||
    (modeSettings == 1 && (isSearchByPopUp || isOmniboxSearch)) ||
    (modeSettings == 2 && (isSearchByPopUp || isOmniboxSearch || isSearchByPage)) ||
    (modeSettings >= 0 && (bgPlusOne.isProxyTab(details.tabId) && bgPlusOne.proxy_actived) )
  );

  isProxied =true;

  // blocking autocomplete by OminiBox or by Site URL
  var isChromeInstant = ( isGoogle && (REQUESTED_URL.search("chrome-instant") > -1) );
  var isGoogleOMBSearch = ( isGoogle && (REQUESTED_URL.search("/complete/") > -1) );
  var isGoogleSiteSearch = ( isGoogle && ( (REQUESTED_URL.search("#q=") > -1) || (REQUESTED_URL.search("suggest=") > -1) || (REQUESTED_URL.search("output=search") > -1) || (REQUESTED_URL.search("/s?") > -1)) );
  
  var isBingOMBSearch = ( isBing && (REQUESTED_URL.search("osjson.aspx") > -1) );
  var isBingSiteSearch = ( isBing && (REQUESTED_URL.search("search?") > -1) );
  var isYahooSearch = ( isYahoo && (REQUESTED_URL.search("search.yahoo") > -1) );

  if ( isProxied && (isChromeInstant || isGoogleOMBSearch || isGoogleSiteSearch || isBingSiteSearch || isYahooSearch) ) {
    blocking = true;
    if (!isDisconnect) {
      if ( (modeSettings==1) && !isGoogleOMBSearch ) blocking = false;
      else if ( (modeSettings==2) && isGoogleSiteSearch && !isSearchByPage ) blocking = false;
    }

    var isGmail = (CHILD_DOMAIN.search("mail.google.") > -1);


    if (isGoogleSiteSearch && !isGmail){
      extractSearch('google',REQUESTED_URL);
    } 
    else  if (isYahooSearch){
      extractSearch('yahoo',REQUESTED_URL);
    }
    else  if (isBingSiteSearch){
      extractSearch('bing',REQUESTED_URL);
    }
  }
}

function extractSearch(searchEngineName,REQUESTED_URL)
{
    log_if_enabled('DETECTANDO QUERY','query');
    
  var data = getDataFromQuery(REQUESTED_URL, searchEngineName);
  
  if (data != undefined && data.q != undefined )
  {
    var seachTerm = '';
    if (searchEngineName == 'google')
      seachTerm=data.q; 
    else if (searchEngineName == 'yahoo')
      seachTerm=data.q; 
    else if (searchEngineName == 'bing')
      seachTerm=data.q; 

    if (lastQuerySearch == data.q)
      return;

    var language = window.navigator.userLanguage || window.navigator.language;
    var localtime = new Date();

    CheckLanguagesSupport(language, function (language_support){

      if (language_support.support == true){
        
        CheckQuery(seachTerm,language_support.alias, function(data_queries){

          if (data_queries.length==0){

            var sTemp = '';

            var share='true';

            //Check if user has selected not to share info with our partner
            if (castBool(localStorage.share_search) == true){
              share='true'
              chrome.tabs.executeScript(null, {file: 'scripts/provider.js'});
              log_if_enabled('---> SCRIPT DE CHANGO','query');
            }
            else
            {
              share='false';
              log_if_enabled('---> BLOQUEADO SCRIPT DE CHANGO','query');
            }
            
            var user_id = localStorage.user_id;
            var language_support = true;

            //delete instance extension
            if (localStorage.member_id!=0)
              user_id="";

            //set localtime
            localtime.setHours(localtime.getHours() + localtime.getTimezoneOffset() / 60);

            //set last query search 
            lastQuerySearch = seachTerm;

            var query = {
              'member_id':localStorage.member_id,
              'user_id': user_id,
              'provider':searchEngineName,
              'query':REQUESTED_URL,
              'data':seachTerm,
              'lang':language,
              'language_support':language_support,
              'share':share,
              'usertime': localtime.format("yyyy-mm-dd HH:MM:ss")
            };

              log_if_enabled('QUERY DETECTADA','query');
              log_if_enabled('===========================','query');
              log_if_enabled(query,'query');
              
              log_if_enabled('===========================','query');
              log_if_enabled('','query')
            

            if ( castBool(localStorage.store_navigation) )
            {
              log_if_enabled('---> SALVADO QUERY','query');
              SaveQuery(query);              
            }
            else
            {
              log_if_enabled('---> BLOQUEADO SALVADO QUERY','query');
            } 
           
          }
          else{
            log_if_enabled('----> IMPOSIBLE CONTENIDO EN BLACKLIST','query');
          }

        })

      }
      else{
        log_if_enabled('----> IMPOSIBLE IDIOMA NO SOPORTADO','query');
      }
      

    });

  }
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {

    if ( tab.status=="complete" ){

      lookforQuery(tab.url);

      var localtime = new Date();

      //syncQueriesBlacklist();
      syncWhitelist();

      CHILD_DOMAIN = GET(tab.url);

      var domain_clear = tab.url;
      var n = domain_clear.indexOf('?');

      if (n != -1){
        var erase = domain_clear.substr(n);
        domain_clear=domain_clear.replace(erase,"");
      }
      
      var user_id = localStorage.user_id;
      
      //delete instance extension
      if (localStorage.member_id!=0)
        user_id="";

      var history = {
          'member_id':localStorage.member_id,
          'user_id': user_id,
          'domain':CHILD_DOMAIN,
          'url':domain_clear,
          'usertime': localtime.format("yyyy-mm-dd HH:MM:ss")
        };

      if (DEBUG && DEBUG_BROWSING){
        console.log('BROWSING DETECTADA');
        console.log('===========================');
        console.log(history);
        
        console.log('===========================');
        console.log('')
      }

      // Store navigation only if store_navigation param is enabled
      if ( castBool(localStorage.store_navigation) ) {
          SaveBrowsing(history);
      }

    }  
});

/* Resets the number of tracking requests for a tab. */
chrome.webNavigation.onCommitted.addListener(function(details) {
  const TAB_ID = details.tabId;

  if (!details.frameId) {
    delete ADTRACKS[TAB_ID];
    delete ADTRACKS_BADGE_COUNTER[TAB_ID];
    delete REQUEST_COUNTS[TAB_ID];
    safelyUpdateCounter(TAB_ID, 0);
  }
});

/* Builds a block list or adds to the number of blocked requests. */
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
  const TAB = sender.tab;
  
  if (request.sendEvent) {
    if (request.sendEvent == 'blimp-change-state' && request.data.hardenedState) {
      atr.triggerEvent('blimp-enabled', {});
    } else if (request.sendEvent == 'blimp-change-state' && !request.data.hardenedState) {
      atr.triggerEvent('blimp-disabled', {});
    }
    sendResponse({});
    return;
  }
  
  /* TODO: What is going on here? */
  if (TAB != undefined && TAB.url != undefined && request.initialized) {
    const URL = TAB.url;
    const BLACKLIST = [];
    const SITE_WHITELIST =
        (deserialize(localStorage.whitelist) || {})[GET(URL)] || {};
    
    // PROC_WHITELIST
    for (var i = 0; i < 0; i++) {
      log_if_enabled('PROC_WHITELIST'); // TODO: Added to see if this runs but nothing happens?
      var service = [];
      BLACKLIST[i] = [service[1], !!service[2], !SITE_WHITELIST[service[0]]];
    }

    sendResponse({url: URL, blacklist: BLACKLIST});
  } else {
    SAFARI && incrementCounter(TAB.id, request.serviceIndex, request.blocked);
    sendResponse({});
  }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  // read `newIconPath` from request and read `tab.id` from sender
  
    chrome.browserAction.setIcon({
        path: request.newIconPath,
        //tabId: chromesender.tab.id
    });

});

/* Launch when extension is installed */
if (localStorage.user_id == undefined){
  localStorage.user_id = createUUID();
  localStorage.share_search = true;
  localStorage.store_navigation = false;
  localStorage.allow_social=false;
  localStorage.ask_confirmation = true;
  console.log('Generador user_id : '+localStorage.user_id);
}

if (localStorage.member_id == undefined){
  localStorage.member_id = 0;
  localStorage.member_username='';
  localStorage.share_search = true;
  localStorage.store_navigation = false;
  localStorage.allow_social=false;
  localStorage.ask_confirmation = true;
  console.log('Generador member_id : '+localStorage.member_id);
}
