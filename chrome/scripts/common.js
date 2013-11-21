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
        
        if (DEBUG && DEBUG_BROWSING){
          var resp = JSON.parse(xhr.responseText);
          console.log('BROWSING SALVADA EN EL API');
          console.log('===========================');
          console.log(resp);
          console.log('===========================');
          console.log('');
        }

        if ( xhr.status == 200)  {
          if (DEBUG && DEBUG_BROWSING)
            console.log(xhr.responseText);
        }
        else  {
          console.log( "Error: " + xhr.status + ": " + xhr.statusText);
        }
      }
  };

  if (DEBUG && DEBUG_BROWSING){
    console.log('BROWSING ENVIADA AL API');
    console.log('===========================');
    console.log(data);
    console.log('===========================');
    console.log('');
  }

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

  xhr.send( localStorage.whitelist);

} 

function loginUser(username,password){

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

      if ( xhr.status == 200)  {

          localStorage.whitelist = xhr.responseText;

          if (DEBUG && DEBUG_CREDENTIAL)
            console.log(xhr.responseText);
        }
        else  {
          console.log( "Error: " + xhr.status + ": " + xhr.statusText);
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
      if(aux[0] == "q") alreadyHasQ = true;
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