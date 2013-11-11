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


function SaveHistory(history){

  var data = new FormData();
  data.append('user_id', history.user_id);
  data.append('domain', history.domain);
  data.append('url', history.url);
  
  var xhr = new XMLHttpRequest();
  xhr.open('POST', "http://localhost/TGD/src/webapp/TGD/api/history", true);
  xhr.onload = function () {
      if (xhr.readyState == 4) {
        // WARNING! Might be evaluating an evil script!
        
        if (DEBUG && DEBUG_HISTORY){
          var resp = JSON.parse(xhr.responseText);
          console.log('HISTORY SALVADA EN EL API');
          console.log('===========================');
          console.log(resp);
          console.log('===========================');
          console.log('');
        }

        if ( xhr.status == 200)  {
          if (DEBUG && DEBUG_HISTORY)
            console.log(xhr.responseText);
        }
        else  {
          console.log( "Error: " + xhr.status + ": " + xhr.statusText);
        }
      }
  };

  if (DEBUG && DEBUG_HISTORY){
    console.log('HISTORY ENVIADA AL API');
    console.log('===========================');
    console.log(data);
    console.log('===========================');
    console.log('');
  }

  xhr.send(data);

}

function SaveThreat(threat){

  var data = new FormData();
  data.append('user_id', threat.user_id);
  data.append('category', threat.category);
  data.append('service_name', threat.service_name);
  data.append('service_url', threat.service_url);
  data.append('url', threat.url);
  data.append('domain', threat.domain);
  
  
  var xhr = new XMLHttpRequest();
  xhr.open('POST', "http://localhost/TGD/src/webapp/TGD/api/threats", true);
  xhr.onload = function () {
      if (xhr.readyState == 4) {

        
        // WARNING! Might be evaluating an evil script!
        if (DEBUG && DEBUG_THREAT){
          var resp = JSON.parse(xhr.responseText);
          console.log('THREAT SALVADA EN EL API');
          console.log('===========================');
          console.log(resp);
          console.log('===========================');
          console.log('');
        }

        if ( xhr.status == 200)  {
          if (DEBUG && DEBUG_THREAT)
            console.log(xhr.responseText);
        }
        else  {
          console.log( "Error: " + xhr.status + ": " + xhr.statusText);
        }

      }
  };

  if (DEBUG && DEBUG_THREAT){
    console.log('THREAT ENVIADA AL API');
    console.log('===========================');
    console.log(data);
    console.log('===========================');
    console.log('');
  }

  xhr.send(data);

}

function SaveQuery(query){

  var data = new FormData();
  data.append('user_id', query.user_id);
  data.append('provider', query.provider);
  data.append('data', query.data);
  data.append('query', query.query);
  data.append('lang', query.lang);
  
  var xhr = new XMLHttpRequest();
  xhr.open('POST', "http://localhost/TGD/src/webapp/TGD/api/queries", true);
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

function LanzarGet(){

  var xhr = new XMLHttpRequest();
  xhr.open("GET", "http://localhost/TGD/src/webapp/TGD/api/users", true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      // WARNING! Might be evaluating an evil script!
      var resp = JSON.parse(xhr.responseText);
      
    }
  }
  xhr.send();

}


function syncWhitelist(){

  var whitelist=localStorage.whitelist
  var user_id = 3;

  var xhr = new XMLHttpRequest();
  var url = "http://localhost/TGD/src/webapp/TGD/api/whitelists/"+user_id;
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