
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
    deactivated && BROWSER_ACTION.setBadgeBackgroundColor({
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
  const TAB_REQUESTS = REQUEST_COUNTS[tabId] || (REQUEST_COUNTS[tabId] = {});
  const CATEGORY = service.category;
  const CATEGORY_REQUESTS =
      TAB_REQUESTS[CATEGORY] || (TAB_REQUESTS[CATEGORY] = {});
  const SERVICE = service.name;
  const SERVICE_REQUESTS =
      CATEGORY_REQUESTS[SERVICE] ||
          (CATEGORY_REQUESTS[SERVICE] = {url: service.url, count: 0});
  SERVICE_REQUESTS.count++;
  safelyUpdateCounter(tabId, getCount(TAB_REQUESTS), !blocked);
}

const ADTRACKS = {};

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

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {

    if ( tab.status=="complete" ){

      
      var localtime = new Date();

      syncQueriesBlacklist();
      syncWhitelist();
      var history = {
          'member_id':localStorage.member_id,
          'user_id': localStorage.user_id,
          'domain':'domain',
          'url':tab.url,
          'usertime': localtime.toUTCString()
        };

      if (DEBUG && DEBUG_BROWSING){
        console.log('BROWSING DETECTADA');
        console.log('===========================');
        console.log(history);
        
        console.log('===========================');
        console.log('')
      }

      SaveBrowsing(history);

    }  
});

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

  if (childService) {

    var allow_social = castBool(localStorage.allow_social);
    if (allow_social==true)
    {
      addWhitelist(CHILD_DOMAIN,'Facebook',true);
      addWhitelist(CHILD_DOMAIN,'Twitter',true);
    }

    const PARENT_DOMAIN = DOMAINS[TAB_ID];
    const PARENT_SERVICE = getService(PARENT_DOMAIN);
    const CHILD_NAME = childService.name;
    const REDIRECT_SAFE = REQUESTED_URL != REQUESTS[TAB_ID];

    if (
      PARENT || !PARENT_DOMAIN || CHILD_DOMAIN == PARENT_DOMAIN ||
          PARENT_SERVICE && CHILD_NAME == PARENT_SERVICE.name ||
              childService.category == CONTENT_NAME
    ) { // The request is allowed: the topmost frame has the same origin.
      if (REDIRECT_SAFE) {
        hardenedUrl = harden(REQUESTED_URL);
        hardened = hardenedUrl.hardened;
        hardenedUrl = hardenedUrl.url;
        if (hardened) blockingResponse = {redirectUrl: hardenedUrl};
      }
    } else if ((
      (deserialize(localStorage.whitelist) || {})[PARENT_DOMAIN] || {}
    )[CHILD_NAME]) { // The request is allowed: the service is whitelisted.
      if (REDIRECT_SAFE) {
        hardenedUrl = harden(REQUESTED_URL);
        hardened = hardenedUrl.hardened;
        hardenedUrl = hardenedUrl.url;
        if (hardened) 
          blockingResponse = {redirectUrl: hardenedUrl};
        else 
          whitelisted = true;
      }
    } 
    else 
    {

      if (isDeactivateCurrent(PARENT_DOMAIN,TAB_ID))
      {
        whitelisted = true; 

        hardenedUrl = harden(REQUESTED_URL);
        hardened = hardenedUrl.hardened;
        hardenedUrl = hardenedUrl.url;
        if (hardened) 
          blockingResponse = {redirectUrl: hardenedUrl};
        else 
          whitelisted = true; 
      }
      // else if (childService.name == 'Facebook' || childService.name == 'Twitter')
      // {
      //   console.log('--->');
      //   whitelisted = true; 

      //   hardenedUrl = harden(REQUESTED_URL);
      //   hardened = hardenedUrl.hardened;
      //   hardenedUrl = hardenedUrl.url;
      //   if (hardened) 
      //     blockingResponse = {redirectUrl: hardenedUrl};
      //   else 
      //     whitelisted = true; 
      // }
      else
      {

        blockingResponse = {
          redirectUrl:
            TYPE == 'image' ?
                'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg=='
                    : 'about:blank'
        }; // The request is denied.
      }
      
    }

    if (blockingResponse.redirectUrl || whitelisted){
      //console.log('BLOQUEADO ALGO en '+PARENT_DOMAIN+'!!!');
      // console.log(childService);

      var localtime = new Date();
      var status='block';

      if (whitelisted == true)
        status = 'allow';

      if ( childService.category == 'Disconnect')
        childService.category='Others';

      var adtrack = {
        'member_id':localStorage.member_id,
        'user_id': localStorage.user_id,
        'category':childService.category,
        'service_name':childService.name,
        'service_url':childService.url,
        'domain':PARENT_DOMAIN,
        'url':details.url,
        'usertime': localtime.toUTCString(),
        'status':status
      };

      if (DEBUG && DEBUG_ADTRACK){
        console.log('ADTRACK DETECTADA');
        console.log('===========================');
        console.log(adtrack);
        
        console.log('===========================');
        console.log('')
      }
      SaveThreat(adtrack);

      if (ADTRACKS[TAB_ID] == undefined){
        ADTRACKS[TAB_ID]= [];
      }

      ADTRACKS[TAB_ID].push(adtrack);
      incrementCounter(TAB_ID, childService, !whitelisted);
    }
  }

  REQUESTED_URL != REDIRECTS[TAB_ID] && delete REQUESTS[TAB_ID];
  delete REDIRECTS[TAB_ID];

  if (hardened) {
    REQUESTS[TAB_ID] = REQUESTED_URL;
    REDIRECTS[TAB_ID] = hardenedUrl;
  }



  /***********************/


  //const PROXY_REDIRECT_BY_PRESETTING = "https://" + bgPlusOne.C_PROXY_PRESETTING;
  //const PROXY_REDIRECT = "https://" + bgPlusOne.C_PROXY_SEARCH + "/search";
  const REGEX_URL = /[?|&]q=(.+?)(&|$)/;
  const REGEX_URL_YAHOO = /[?|&]p=(.+?)(&|$)/;
  //const TYPE = details.type;
  const T_MAIN_FRAME = (TYPE == 'main_frame');
  const T_OTHER = (TYPE == 'other');
  const T_SCRIPT = (TYPE == 'script');
  const T_XMLHTTPREQUEST = (TYPE == 'xmlhttprequest');
  //var REQUESTED_URL = details.url;
  //const CHILD_DOMAIN = getHostname(REQUESTED_URL);

  //var blockingResponse = {cancel: false};
  var blocking = presetting = false;

  
  var isGoogle = (CHILD_DOMAIN.search("google.") == 0);
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
  //if (isDisconnectSearchPage) updatestats();

  // if (isDisconnectSite) {
  //   var CONTROL = document.getElementById('input-type');
  //   //console.log(CONTROL);
  //   var BUCKET = CONTROL && CONTROL.getAttribute('value');
  //   //console.log("BUCKET: " + BUCKET);
  //   localStorage.pwyw = JSON.stringify({pwyw: true, bucket: BUCKET});
  // }

    

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
  var isChromeInstant = ( isGoogle && T_MAIN_FRAME && (REQUESTED_URL.search("chrome-instant") > -1) );
  var isGoogleOMBSearch = ( isGoogle && T_OTHER && (REQUESTED_URL.search("/complete/") > -1) );
  var isGoogleSiteSearch = ( (isGoogle || isDisconnect) && T_XMLHTTPREQUEST && !hasGoogleImgApi && ((REQUESTED_URL.search("suggest=") > -1) || (REQUESTED_URL.search("output=search") > -1) || (REQUESTED_URL.search("/s?") > -1)) );
  
  // var isBingOMBSearch = ( isBing && T_OTHER && (REQUESTED_URL.search("osjson.aspx") > -1) );
  // var isBingSiteSearch = ( (isBing || isDisconnect) && T_SCRIPT && (REQUESTED_URL.search("qsonhs.aspx") > -1) );
  // var isBlekkoSearch = ( (isBlekko || isDisconnect) && (T_OTHER || T_XMLHTTPREQUEST) && (REQUESTED_URL.search("autocomplete") > -1) );
  // var isYahooSearch = ( (isYahoo || isDisconnect) && T_SCRIPT && (REQUESTED_URL.search("search.yahoo") > -1) && ((REQUESTED_URL.search("jsonp") > -1) || (REQUESTED_URL.search("gossip") > -1)) );
  
  

  //if ( (isProxied || isDisconnect || modeSettings==2) && (isChromeInstant || isGoogleOMBSearch || isGoogleSiteSearch || isBingOMBSearch || isBingSiteSearch || isBlekkoSearch || isYahooSearch) ) {
  if ( (isProxied || isDisconnect || modeSettings==2) && (isChromeInstant || isGoogleOMBSearch || isGoogleSiteSearch) ) {
    blocking = true;
    if (!isDisconnect) {
      if ( (modeSettings==1) && !isGoogleOMBSearch ) blocking = false;
      else if ( (modeSettings==2) && isGoogleSiteSearch && !isSearchByPage ) blocking = false;
    }

    var isGmail = (CHILD_DOMAIN.search("mail.google.") > -1);

    // if (blocking && isGoogleSiteSearch && !isGmail)  {
    //    blockingResponse = { cancel: true };
    // }

    if (isGoogleSiteSearch && !isGmail){
      
      var searchEngineName = 'google';

      var data = getDataFromQuery(REQUESTED_URL, searchEngineName);
      
      if (data != undefined && data.q != undefined && data.tok == undefined)
      {

        var language = window.navigator.userLanguage || window.navigator.language;
        var localtime = new Date();

        // console.log('-------------');
        // console.log(data);
        // console.log('-------------');

        CheckQuery(data.q, function(data_queries){

          if (data_queries.length==0){

            var sTemp = '';

            var share='true';

            //Check if user has selected not to share info with our partner
            if (castBool(localStorage.share_search)){
              share='true';
              console.log('---> SCRIPT DE CHANGO');
            }
            else
            {
              share='false';
              console.log('---> BLOQUEADO SCRIPT DE CHANGO');
            }
            // sTemp += 'var myElem = document.getElementById("layer-tgd");';
            // sTemp += 'if (myElem != null){';
            // sTemp += '  myElem.parentNode.removeChild(myElem);';
            // sTemp += '}';
            // sTemp += '';
            // sTemp += 'var div = document.createElement("div");';
            // sTemp += 'div.id="layer-tgd";';
            // sTemp += 'div.style.display="block";';
            // sTemp += 'div.style.width = "600px";';
            // sTemp += 'div.style.height = "30px";';
            // sTemp += 'div.style.padding = "15px 15px 15px 15px";';
            // sTemp += 'div.style.margin = "15px 0 15px 0";';
            // sTemp += 'div.style.background = "#C2E2FF";';
            // sTemp += 'div.style.color = "grey";';
            // sTemp += 'div.innerHTML = "SE ACABA DE AÑADIR EL SCRIPT PARA CHANGO";';
            // sTemp += 'document.body.insertBefore(div, document.body.firstChild);';

            // chrome.tabs.executeScript(null,
            //   {code:sTemp});



            var query = {
              'member_id':localStorage.member_id,
              'user_id': localStorage.user_id,
              'provider':searchEngineName,
              'query':REQUESTED_URL,
              'data':data.q,
              'lang':language,
              'share':share,
              'usertime': localtime.toUTCString()
            };

            if (DEBUG && DEBUG_QUERY){
              console.log('QUERY DETECTADA');
              console.log('===========================');
              console.log(query);
              
              console.log('===========================');
              console.log('')
            }

            if ( castBool(localStorage.store_navigation) )
            {
              console.log('---> SALVADO QUERY');
              SaveQuery(query);              
            }
            else
            {
              console.log('---> BLOQUEADO SALVADO QUERY');
            }

          }
          else{
            console.log('----> IMPOSIBLE');
          }

        })
        
          
      }
    }  
  }
 
  return blockingResponse;
}, {urls: ['http://*/*', 'https://*/*']}, ['blocking']);

/* Resets the number of tracking requests for a tab. */
chrome.webNavigation.onCommitted.addListener(function(details) {
  const TAB_ID = details.tabId;

  if (!details.frameId) {
    delete ADTRACKS[TAB_ID];
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
  
  if (TAB != undefined && TAB.url != undefined && request.initialized) {
    const URL = TAB.url;
    const BLACKLIST = [];
    const SITE_WHITELIST =
        (deserialize(localStorage.whitelist) || {})[GET(URL)] || {};

    // console.log('SITE_WHITELIST');
    // console.log(SITE_WHITELIST);

    for (var i = 0; i < 0; i++) {
      var service = [];
      BLACKLIST[i] = [service[1], !!service[2], !SITE_WHITELIST[service[0]]];
    }

    // console.log('BLACKLIST');
    // console.log(BLACKLIST)

    sendResponse({url: URL, blacklist: BLACKLIST});
  } else {
    SAFARI && incrementCounter(TAB.id, request.serviceIndex, request.blocked);
    sendResponse({});
  }
});


/* Launch when extension is installed */
if (localStorage.user_id == undefined){
  localStorage.user_id = createUUID();
  console.log('Generador user_id : '+localStorage.user_id);
}

if (localStorage.member_id == undefined){
  localStorage.member_id = 0;
  localStorage.member_username='';
  console.log('Generador member_id : '+localStorage.member_id);
}
