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

*/





//////////////////
// Declarations //
//////////////////

/**
 * Background scope.
 * @type {Object}
 */
var BACKGROUND = chrome.extension.getBackgroundPage();

/**
 * String value representing the content category.
 * @type {String}
 */
var CONTENT_NAME = BACKGROUND.CONTENT_NAME;

/**
 * The third parties.
 * @type {Array}
 */
var SERVICES = ['Facebook', 'Google', 'Twitter', 'Yahoo!'];

/**
 * The "tabs" API.
 * @type {Object}
 */
var TABS_API = BACKGROUND.TABS_API;

/**
 * The current active tab.
 * @type {Object}
 */
var TAB_CURRENT;

/**
 * Variables namespaced for the "share achievements"
 * @type {Object}
 */
Share = {
  killTooltip: true,
  stopSlide : false,
  onEventsCalled : false
};





//////////////
// Adtracks //
//////////////

/**
 * Render adtracks in the extension's HTML table.
 * @param  {Object}     tab   The tab whose trackers are being processed.
 * @return {undefined}     
 */
function renderAdtracks(tab) {  
  
  var tab_id         = tab.id;
  var tab_domain     = BACKGROUND.SITENAME_GET_DOMAIN(tab.url);

  var whitelist      = BACKGROUND.deserialize(localStorage.whitelist) || {};

  var i;

  var adtracks       = new Hash();
  var adtracks_count = new Hash();
  var adtrack, adtrack_key, count;
  var data_status, data_status_value, data_status_text, title, trading_style, selector;
  var rows, amounts, amountName, offset;

  var allow_threats;

  function partialSort(arr, start, end, index) {
      var preSorted = arr.slice(0, start);
      var postSorted = arr.slice(end);

      var sorted = arr.slice(start, end).sort(function(a,b){
        var A = $(a).children().eq(index).text().toUpperCase(),
            B = $(b).children().eq(index).text().toUpperCase();
        
        if(A < B) {
          return 1;
        }

        if(A > B) {
          return -1;
        }
        
        return 0;
      });
      arr.length = 0;
      arr.push.apply(arr, preSorted.concat(sorted).concat(postSorted));

      return arr;
  }

  // Clear HTML list.
  $("#layer_adtracks > tbody").html(""); 
      
  // Set counter to adtracks_count hash
  // and fill the adtracks hash.
  for (i in BACKGROUND.ADTRACKS[tab_id]) {
    adtrack     = BACKGROUND.ADTRACKS[tab_id][i];
    adtrack_key = adtrack.service_name + ":" + adtrack.category;
    adtracks.setItem(adtrack_key, adtrack);

    if (!adtracks_count.hasItem(adtrack_key)){
      adtracks_count.setItem(adtrack_key,1);
    } else {
      count = adtracks_count.getItem(adtrack_key);
      count++;
      adtracks_count.setItem(adtrack_key,count);
    }
  }

  //Render Adtracks in GUI
  allow_threats = getAllowThreatsInCurrent(tab_domain);
  i = 0;
  for (service in adtracks.items) {
    adtrack = adtracks.items[service];

    data_status = false; // default
    if (allow_threats === true || adtrack.status.toLowerCase() == 'allowed') {
      data_status = true;
    }

    data_status_value = 'BLOCKED'; // default
    if (data_status === true) {
      data_status_value = 'ALLOWED';
    }
    
    data_status_text = data_status_value; // default
    if (adtrack.status_extra.status_text) {
      data_status_text = adtrack.status_extra.status_text;
    }
    
    trading_style = ''; // default
    if (adtrack.status_extra.button_style) {
      trading_style = adtrack.status_extra.button_style;
    }
    
    title = ''; // default
    if (adtrack.status_extra.button_title) {
      title = adtrack.status_extra.button_title;
    }

    selector = '#layer_adtracks tbody';
    count = adtracks_count.getItem(service);
    $(selector).append('<tr><td>' + count + '</td><td>' + adtrack.category + '</td><td>' + adtrack.service_name + '</td><td><div title="' + title + '" style="' + trading_style + '" class="' + (allow_threats?'':'btnAdtrack') + ' button ' + data_status_value.toLowerCase() + '" data-service_name="' + adtrack.service_name + '" data-category="' + adtrack.category + '" data-status="' + data_status + '">' + data_status_text + '</div></td></tr>');

    i++;
  }

  //Sort adtracks
  rows = $('#layer_adtracks tbody  tr').get();

  if (i > 1) {  
    // sort by number of threats
    rows.sort(function(a, b) {
      var A = parseInt($(a).children().eq(0).text(), 10),
          B = parseInt($(b).children().eq(0).text(), 10);
          
      if(A < B) {
        return -1;
      }

      if(A > B) {
        return 1;
      }
      return 0;
    });

    // group by amount of threats and sort
    amounts = {};
    $.each(rows, function(index, row){
      var value = parseInt($(row).children().eq(0).text(), 10);
      if(typeof(amounts[value]) == "undefined"){
        amounts[value] = 1;
      }else{
        amounts[value] += 1;
      }
    });

    offset = 0;
    for(key in amounts){
      if(amounts.hasOwnProperty(key)){
        partialSort(rows, offset, offset + amounts[key], 1);
        offset += (amounts[key]);
      }
    }
    
    // group by amount:name
    amountName = {};
    $.each(rows, function(index, row){
      var value = $(row).children().eq(0).text() + $(row).children().eq(1).text();
      if(amounts[value] == undefined){
        amountName[value] = 1;
      }else{
        amountName[value] += 1;
      }
    });

    offset = 0;
    for(key in amounts){
      if(amounts.hasOwnProperty(key)){
        partialSort(rows, offset, offset + amounts[key], 2);
        offset += (amounts[key]);
      }
    }
  }

  $('#layer_adtracks tbody').append(rows.reverse());

  // show/hide expand button for threats list
  if (i === 0){
    $('#layer_adtracks').hide();
  } else {
    $('#layer_adtracks').show();
  }

  //Render elements count
  if (typeof(BACKGROUND.ADTRACKS[tab_id]) != "undefined"){
    count = BACKGROUND.ADTRACKS[tab_id].length;
    $('#layer_adtracks_count').html(count);
    if(count === 0){
      $('#btnExpandAdtracks').hide();
    }
  }else{
    $('#btnExpandAdtracks').hide();
  }
}





//////////////////
// Achievements //
//////////////////

/**
 * Write Achievements values
 * @param  {Array} achievements  List of acheievemnts as an array.
 * @return {undefined}              
 */
function writeAchievement(achievements){
  
  // get unread achievements var
  var has_unread_achievements = false;
  var $header_message_container;
  var read_achievements, reordered_achievements, reordered_achievements_first, reordered_achievements_last;
  var achievement;
  var element, length, current, timeout;
  var i;

  function changeSlide() {
    if(Share.stopSlide){
      setTimeout(changeSlide, 1000);
    }else{
      element.eq(current++).fadeOut(300, function(){
          if(current === length){
              current = 0;
          }
          
          // mark achievement as read after showing it
          markAchievementAsRead(element.eq(current).attr('data-id'));
          
          element.eq(current).fadeIn(300);
      });
      
      setTimeout(changeSlide, timeout);
    }
  }

  if (typeof(localStorage.hasUnreadAchievements) !== 'undefined') {
    has_unread_achievements = castBool(localStorage.hasUnreadAchievements);
  }
  
  // add/remove unread class from header
  $header_message_container = $('section#content header .message');
  if (has_unread_achievements) {
    $header_message_container.addClass('unread');
  } else {
    $header_message_container.removeClass('unread');
  }
  
  $("#layer_achievement_value").empty();
  
  // reorder list based on what was already read and show first unread first
  read_achievements            = BACKGROUND.deserialize(localStorage.readAchievements) || [];
  reordered_achievements       = [];
  reordered_achievements_first = [];
  reordered_achievements_last  = [];
  for (i = 0; i < achievements.length; i++) {
    if (read_achievements.indexOf(achievements[i].id) === -1) {
      reordered_achievements_first.push(achievements[i]);
    } else {
      reordered_achievements_last.push(achievements[i]);
    }
  }
  reordered_achievements = reordered_achievements_first.concat(reordered_achievements_last);
  
  for(i = 0; i < reordered_achievements.length; i++){
    achievement = reordered_achievements[i];
    
    // mark first achievement already as read because it has been already displayed when the popup was opened
    if (i===0) {
      markAchievementAsRead(achievement.id);
    }
    
    $("#layer_achievement_value").append('<li data-id="'+achievement.id+'"><p><i></i><a href="'+achievement['link'+LANG]+'" target="_blank">'+achievement['text'+LANG]+'</a></p></li>');
  }

  element = $('#layer_achievement_value li');
  length  = element.length;
  current = 0;
  timeout = 5000;
  if(element.length > 1){
    element.slice(1).hide();
    setTimeout(changeSlide, timeout); 
  }
}

/**
 * Render Achievement in extension
 * @return {undefined} 
 */
function renderAchievement(){
  loadAchievements(writeAchievement);
}





/////////////
// Queries //
/////////////

/**
 * Write achievements value into the pop-up HTML.
 * @param  {Number}    queries Number of queries contributed.
 * @return {undefined}         
 */
function writeQueries(queries){
  $("#layer_achievement_contributions").html(queries.toString());
}

/**
 * Loads queries count and renders it in the extension.
 * @return {undefined} 
 */
function renderQueries(){
  if(typeof(localStorage.queries) !== "undefined"){
    writeQueries(JSON.parse(localStorage.queries));
  }
  loadQueries(writeQueries);
}





///////////
// Loans //
///////////

/**
 * Write loans value into the pop-up HTML.
 * @param  {Number}    loans [description]
 * @return {undefined}  
 */
function writeLoans(loans){
  $('#layer_loans_value').html(loans);
}

/**
 * Loads loans count and renders it in the extension
 * @return {undefined} 
 */
function renderLoans(){
  loadLoans(writeLoans);
}





//////////////////
// Contributed  //
//////////////////

/**
 * Writes the seniority icon and data into the extension's pop-up HTML.
 * @param  {Object} percentileData Seniority data.
 * @return {undefined}                
 */
function writeContributed(percentileData){

  // Apprentice: users that are in the bottom 5% in terms of data items shared last month (unless they are cooperative members)
  // Journeyman: users that are not apprentices nor cooperative members
  // Owner: cooperative members that are in the bottom 20% in terms of data items shared last month (unless they are managers)
  // Expert: cooperative members that are not owners nor managers
  // Collaborator: cooperative members that have participated in the collaboration platform in the last month. Participation includes any kind of activity (posting content or commentaries, voting, setting up or completing tasks, etc)
  // console.log(percentileData);
  
  var text = percentileData.level,
      img = percentileData.icon,
      color = percentileData.color;
  $("#layer_usertype_title").html(text.toUpperCase());
  //$('#layer_usertype_title').css('color', color);
  $("#layer_usertype_image").
    attr("src", TGD_API + "uploads/seniority/" + img).
    addClass("icon " + text.toLowerCase()).
    show();// not every icon is the same so some css styling must be applied.
}

/**
 * Loads seniority data and shows it in the extension's pop-up.
 * @return {undefined} 
 */
function renderContributed(){
  if(typeof(localStorage.contributed) !== "undefined"){
    writeContributed(JSON.parse(localStorage.contributed));
  }

  loadContributed(writeContributed);

  if (localStorage.member_id != "0"){
    $('#button_delete_stored_data').hide();
  }else{
    $('#button_delete_stored_data').show();
  }
}





/////////////
// Buttons //
/////////////

/**
 * Set button's look for the "ON" state.
 * @param {String} id   Button's id.
 */
function setButtonOn(id){
  $(id).html('ON');
  $(id).removeClass('off');
  $(id).addClass('on');
}

/**
 * Set button's look for the "OFF" state.
 * @param {String} id   Button's id.
 */
function setButtonOff(id){
  $(id).html('OFF');
  $(id).removeClass('on');
  $(id).addClass('off');
}

/**
 * Set button's state.
 * @param {String} status Status to be set.
 * @param {String} id     Button's id.
 */
function setButton(status, id){
  if (status === true) {
    setButtonOn(id);
  } else {
    setButtonOff(id);
  }
}





/////////////
// Options //
/////////////

/**
 * Render active extension's options.
 * @param  {Object}     tab Active tab.
 * @return {undefined}     
 */
function renderOptions(tab){

  // Store navigation and non-sensitive queries?
  if (typeof(localStorage.store_navigation) === 'undefined') {
    localStorage.store_navigation=option_default_store_navigation;
  }

  var store_navigation = castBool(localStorage.store_navigation) ;
  setButton(store_navigation,'#layer_config_store_navigation');

  // Trade non-sensitive queries?
  if (feature_trade_sensitive_queries) {
      $('#layer_config_share_search_container').show();
  } else {
      $('#layer_config_share_search_container').hide();
  }
  
  if (typeof(localStorage.share_search) === 'undefined') {
    localStorage.share_search=true;
  }

  var share_search = castBool(localStorage.share_search);
  setButton(share_search,'#layer_config_share_search');

  // Allow social networks?
  if (typeof(localStorage.allow_social) === 'undefined') {
    localStorage.allow_social=false;
  }

  var allow_social = castBool(localStorage.allow_social);
  setButton(allow_social,'#layer_config_allow_social');
}

/**
 * Set the status for the "Allow threats on this site" button. 
 * @param  {String} domain Domain for which the threats will be allowed/denied.
 * @return {undefined}        
 */
function renderDeactivateCurrent(domain){
  setButton(getAllowThreatsInCurrent(domain),'#layer_config_deactivate_current');
}




////////////
// Header //
////////////

/**
 * Writes the HTML for the extension's pop-up header.
 * @return {undefined} 
 */
function renderHeader(){

  //console.log(localStorage.member_id);
  if (localStorage.member_id !== 0){
    $('header .username').text(localStorage.member_username);
    $('header .authenticated').show();
    $('header .anonymous').hide();
    $('#content').addClass('authenticated');
  }
  else
  {
    $('header .authenticated').hide();
    $('header .anonymous').show();
    $('#content').removeClass('authenticated');
  }
}





///////////
// Links //
///////////

/**
 * Render the link's
 * @return {undefined} 
 */
function renderLinks(){
  $('#forgotPassword').attr('href',TGD_URL+'user/recovery');
  $('#moreStats').attr('href',TGD_URL+'evil-data');
  $('#moreAchievements').attr('href',TGD_URL+'good-data');
  $('#moreProjects').attr('href',TGD_URL+'good-data');
  $('#moreAboutYou').attr('href',TGD_URL+'your-data'); // todo change this to your-data after deploying webapp to prod
}





//////////////////////
// Suggestion form //
//////////////////////

/**
 * Set the suggestions form dimensions so it fills the pop-up height.
 */
function setSuggestionFormDimensions() {
  var $suggestion = $('#suggestion');
  var $content    = $('#content');
  var popupHeight = $content.innerHeight();

  $suggestion.innerHeight(popupHeight);
}

/**
 * Set the spinner dimension for the suggestion form so it is centered in the pop-up.
 */
function setSpinnerDimensions() {
  var $suggestionBody    = $('#suggestion .body');
  var $suggestionSpinner = $('#suggestion-spinner');
  var bodyHeight         = $suggestionBody.innerHeight();
  var bodyWidth          = $suggestionBody.innerWidth();

  $suggestionSpinner.innerHeight(bodyHeight);
  $suggestionSpinner.innerWidth(bodyWidth);
}

/**
 * Defines the event handler for the form sumbmission process.
 * @return {undefined} 
 */
function bindSuggestionFormEvents() {
  $('#suggestion-submit').click(function(event){

    var $form          = $('#suggestion-form');
    var $spinner       = $('#suggestion-spinner');
    var $formContainer = $('#suggestion-form-container');
    var postData       = $form.serializeArray();
    var formURL        = $form.attr("action");

    postData.push({'name': 'id', 'value': localStorage.member_id});

    //    if(localStorage.member_id != 0){
    //      postData.push({'name': 'username', 'value': localStorage.member_username});
    //    }

    setSpinnerDimensions();

    $form.remove();
    $spinner.show();

    $.post(formURL, postData)
    .done(
      function(data, textStatus, jqXHR) {
        $spinner.hide();
        $formContainer.html(data);

        showHideEmailField();
        bindSuggestionFormEvents();
      })
    .fail(
      function(jqXHR, textStatus, errorThrown){
        var message = $('<div class="ops">\
                          <h1>Ops!</h1>\
                          Something went wrong while trying to fetch the form from our servers.<br/><br/>\
                          Please send us your suggestion via e-mail to the following address: <span class="email">suggestions@thegooddata.org</span>\
                        </div>');
                        
        $spinner.hide();
        $formContainer.html(message);
      });
  });
}

/**
 * Determine if the email field has to be shown or not and update the form accordingly.
 * @return {undefined} 
 */
function showHideEmailField() {
  if(localStorage.member_id !== "0"){
    $('#suggestion-form div.row:first-child').hide();
    $('#suggestion-form textarea').height(200);
  }
  else
  {
    $('#suggestion-form div.row:first-child').show();
    $('#suggestion-form textarea').height(150);
  }
}

/**
 * Compose the sugestion form.
 * @return {undefined} 
 */
function buildSuggestionForm() {
  if($('#suggestion-form').length < 1){
    $.get( TGD_URL+"suggestion/ajax")
    .done(function( data ) {
      $("#suggestion-form-container" ).html( data );
      showHideEmailField();
      bindSuggestionFormEvents();
    })
    .fail(function( data ) {
      var message = $('<div class="ops">\
                          <h1>Ops!</h1>\
                          Something went wrong while trying to fetch the form from our servers.<br/><br/>\
                          Please send us your suggestion via e-mail to the following address: <span class="email">suggestions@thegooddata.org</span>\
                        </div>');
      $("#suggestion-form-container" ).html( message );
    });

  }
}





/////////////
// on load //
/////////////

/**
 * Holds the function calls that take place upon loading the pop-up.
 * @return {undefined} 
 */
function onLoad(){
    
  var tab = TAB_CURRENT;
  var id = tab.id;
  var domain = BACKGROUND.SITENAME_GET_DOMAIN(tab.url);
  

  //Render links
  renderLinks();

  //Render Correct Header
  renderHeader();

  //Render adtracks in table
  renderAdtracks(tab);

  //Render achievement
  renderAchievement();

  //Render loans counter
  renderLoans();

  //Render Queries counter
  renderQueries();

  //Render Contributed counter
  renderContributed();

  //Render Options
  renderOptions(tab);

  //Render deactivate current
  renderDeactivateCurrent(domain,tab);

  //Render extension icon
  renderExtensionIcon();

  // onEvents is called multiple times during extension execution.
  // This causes event handlers being attached more than once to an element
  // resulting in undesired behaviour.
  // TODO: This needs to be fixed
  if(!Share.onEventsCalled){
    onEvents(domain, tab);
  }
}





////////////
// Events //
////////////

/**
 * Define events handler for the pop-up.
 * @param  {String} domain  The domain name of the current site.
 * @param  {Object} tab     The current tab.
 * @return {undefined}        
 */
function onEvents(domain, tab) {
  $( document ).ready(function() {
        
    // Remove focus from links
    $('a').blur();
    
    //Event click button "expand adtracks"
    $('#btnExpandAdtracks').click(function () {
      if ( $( "#layer_adtracks_expand" ).is( ":hidden" ) ) {
        $( "#layer_adtracks_expand" ).show();
        $( "#btnExpandAdtracks" ).removeClass( "fa-plus collapsed" );
        $( "#btnExpandAdtracks" ).addClass( "fa-minus expanded" );
      } else {
        $( "#layer_adtracks_expand" ).hide();
        $( "#btnExpandAdtracks" ).removeClass( "fa-minus expanded" );
        $( "#btnExpandAdtracks" ).addClass( "fa-plus collapsed" );
      }
      event.preventDefault();
    });

    //Event click button "show sign-in form"
    $('#btnLogin').click(function (event) {
      var $signin     = $( "#sign-in" );
      var $content    = $( "#content" );
      var popupHeight = $content.innerHeight();

      $signin.innerHeight(popupHeight);

      if ( $signin.is( ":hidden" ) ) {
        $content.hide();
         $signin.fadeIn( "slow" );
      } else {
        $signin.fadeOut( "slow", function(){
          $content.show();
        });
      }
      event.preventDefault();  
    });

    // Click event on button "close sign-in form"
    $( '#sign-in .close' ).click(function(){
      $( '#btnLogin' ).click();
    });

    // Cick event on button "close suggestion form"
    $('#suggestion .close').click(function(){
      var $suggestion = $( "#suggestion" );
      var $content    = $( "#content" );

      if($( "#suggestion > .ops" ).length > 0){
        $( "#suggestion > .ops" ).remove();
      }

      if($( "#suggestion > .thanks" ).length > 0){
        $( "#suggestion > .thanks" ).remove();
      }

      $suggestion.fadeOut( "slow", function(){
        $( "#suggestion-spinner" ).hide();
        $content.show();
        $( "#suggestion_title" ).show();
      });
    });



    $( "#in-love .email-us" ).click(function(event){
      var $suggestion = $( "#suggestion" );
      var $content    = $( "#content" );
      var $form       = $( "#suggestion-form" );
      var memberId    = localStorage.member_id;

      setSuggestionFormDimensions();
      buildSuggestionForm();

      $content.fadeOut( "slow", function(){
        $('#suggestion-spinner').hide();
        $form.show();
        $suggestion.show();
      });
    });


    // Event click button "delete stored data"
    $('.deleteQueries').click(function(){
      deleteQueries(
        function(data){
          chrome.tabs.getCurrent(function (tab){
            localStorage.user_id = createUUID();
            onLoad(tab);
          });
        },
        function (error){
        }
      );
    });

    // Event click button "sign in"
    $('#btnSignIn').click(function (event) {
      var username = $('#txtUsername').val();
      var password = $('#txtPassword').val();
      
      $('#pError').html("");
      
      if (username === "" || password === "") {
        $('#pError').html("Invalid username or password.");
      } else {
        loginUser(
          username,
          password, 
          function (){ // success
            $('#btnLogin').click();
            $('#txtUsername').val('');
            $('#txtUsername').val('');
            // changeExtensionIcon('on');
            $('#sign-in').fadeOut('slow');
            onLoad();
          },
          function (error){ // fail
            $('#pError').html(error);
          }
        );
      }
      event.preventDefault();
    });

    // submit on cicking "enter"
    $("#login-form input").keypress(function(event) {
      if (event.which == 13) {
          $('#btnSignIn').click();
      }
    });

    // Event click button "Deactivate Current"
    $('#not-working').on('click', '.btnDeactivateCurrent', function() { 

      var id       = tab.id;
      var s_status = $(this).html();
      var status   = false;
      var url      = BACKGROUND.SITENAME_GET_DOMAIN(TAB_CURRENT.url);
      if (s_status == 'ON') {
        status = true;
      }else if (s_status == 'OFF') {
        status = false;
      }

      try {
        setAllowThreatsInCurrent(url, !status);
      } catch(err) {
        console.log(err);
      }

      
      //syncWhitelist();

      TABS_API.reload(id);

      //Render Options
      renderOptions(tab);

      //Render deactivate current
      renderDeactivateCurrent(domain,tab);

      //Render adtracks in table
      //renderAdtracks(tab);

      // Temp fix closing window so it will render new stats when opening again.
      window.close();

      event.preventDefault();
    });

    // Event click button "Allow Social"
    $('#not-working').on('click', '.btnAllowSocial', function() { 
      var allow_social = castBool(localStorage.allow_social);
      var id           = tab.id;

      localStorage.allow_social = !allow_social;

      //console.log('visualizar '+allow_social);
      renderOptions(tab);

      setWhitelistStatus('Facebook','Social', allow_social);
      setWhitelistStatus('Twitter','Social', allow_social);
      
      // syncWhitelist();
      
      TABS_API.reload(id);
      
      //Render adtracks in table
      // renderAdtracks(tab);
      
      // Temp fix closing window so it will render new stats when opening again.
      window.close();
    });

    // Event click button "Store Navigation"
    $('#level').on('click', '.btnStoreNavigation', function() { 
      var store_navigation = castBool(localStorage.store_navigation);

      store_navigation=!store_navigation;

      localStorage.store_navigation = store_navigation;
      
      // Save to API
      saveUserSettingsToAPI();

      //console.log('visualizar '+store_navigation);
      renderOptions(TAB);
    });
    
    // Event click button "Trade non-sensitive queries"
    $('#level').on('click', '.btnShareSearch', function() { 
      var share_search = castBool(localStorage.share_search);

      share_search = !share_search;

      localStorage.share_search = share_search;

      //console.log('visualizar '+share_search);
      //renderOptions(TAB);
      
      setButton(castBool(localStorage.share_search),'#layer_config_share_search');
      
      var ID = TAB.id;
      
      TABS_API.reload(ID);
      
      // Temp fix closing window so it will render new stats when opening again.
      // window.close(); // disabled window close for now.
    });

    // Event click button "blocked / allowed"
    $('#layer_adtracks').on('click', '.btnAdtrack', function() { 
      var id           = tab.id;
      var service_name = $(this).data("service_name");
      var status       = $(this).data("status");
      var category     = $(this).data("category");

      setWhitelistStatus(service_name,category,!status);

      //syncWhitelist();
      
      TABS_API.reload(id);
    
      // Temp fix closing window so it will render new stats when opening again.
      window.close();
                                          
      //Render adtracks in table
      //renderAdtracks(TAB);
      
      //Render
      //onLoad();

      event.preventDefault();
    });
    
    // Reset preferences for all sites / clear whitelist
    $('#reset_site_pref').on('click', function() { 
      var $buttons      = $('#confirmation .buttons');
      var $confirmation = $('#confirmation');
      var $wrapper      = $('#confirmation .wrapper');
      var $message      = $('#confirmation .message');
      var id;

      if($confirmation.is(':visible')){
        $confirmation.slideUp();
        return;
      }

      // if the user had chosen not to receive confirmation
      if(castBool(localStorage.ask_confirmation) === false){

        resetEntireWhitelist();

        // hide the buttons divs and move the confirmation to the left
        $buttons.hide();
        $wrapper.css({left: "-320px"});
        $confirmation.slideDown({
          complete: function() {

            setTimeout(function(){
              // slide up and restore
              $confirmation.slideUp({
                complete: function() {
                  // restore buttons div an confirmation div to their original state
                  $buttons.show();
                  $wrapper.css({left: "0px"});
                }
              });
            },2000);
          }
        });


        syncWhitelist();
        id = tab.id;
        TABS_API.reload(id);
        // window.close(); TODO: necessary?
        return;
      }

      // otherwise, just slide the confirmation div down
      $('#confirmation').slideDown();
    });

    // cancel resetting preferences
    $('#reset_pref_cancel').on('click', function() {
      $('#confirmation').slideUp();
    });

    // accept resetting preferences
    $('#reset_pref_ok').on('click', function() {
      var $confirmation = $('#confirmation');
      var $wrapper = $('#confirmation .wrapper');
      var $message = $('#confirmation .message');
      var $alert = $('#confirmation .alert');
      var id;

      if($('#ask_confirmation').is(':checked')){
        localStorage.ask_confirmation = false;
      }

      resetEntireWhitelist();
      $wrapper.animate({left: "-320px"}, {
        complete: function() {
            setTimeout(function(){
              // slide up and restore
              $confirmation.slideUp({
                complete: function() {
                  $wrapper.css({left: "0px"});

                  syncWhitelist();
                  id = tab.id;
                  TABS_API.reload(id);
                }
              });
            },2000);
          }
      });
    });

    // Event click button "BECOME A MEMBER"
    $('#become-member').click(function(){
      TABS_API.create({url: TGD_URL + 'apply'});
    });

    // Event click button "Email us"
    $('#in-love').on('click','.email-us', function(){
    });

    // Event click button "Become owner"
    $('#in-love').on('click','.become-owner', function(){
      TABS_API.create({url: TGD_URL + '/user/registration'});
      return false;
    });

    // Event click button "Donate"
    $('#in-love').on('click','.donate', function(){
      TABS_API.create({url: TGD_URL + '/donate'});
      return false;
    });

    // Event click button "Sign out"
    $('#header').on('click','#btnLogout', function(){
      
      $.get( TGD_URL + "/user/logout", function( data ) {
        getLoggedUser(function () { onLoad(); }, function () { onLoad(); });
      });
    });

    // Event click on any link
    $('body a').click(function(){
      TABS_API.create({url: this.getAttribute('href')});
      return false;
    });

    // Activate tooltips for sing-in sign-out buttons
    $('#btnLogin, #btnLogout').tooltip();

    // Activate tooltip for sharing header message
    $('#layer_achievement_id').tooltip({
      "animation": true,
      "html": true, 
      "placement": "bottom", 
      "trigger": "manual",
      "title": "<i class='fa fa-facebook'></i><br/><i class='fa fa-twitter'></i><br/><i class='fa fa-google-plus'></i>"
    }).mouseenter(function(){
      // cache $(this) for later use inside event handlers
      var $that = $(this);

      // show tooltip
      $that.tooltip('show');

      // stp slide
      Share.stopSlide = true;

      // hides tootip on mouseleave
      $('.tooltip').mouseleave(function(){
        $that.tooltip('hide');
        Share.killTooltip = true;
        Share.stopSlide   = false;
      }).mouseenter(function(){
        Share.killTooltip = false;
      });

      // hides tooltip on mouseclick on any of the social icons
      $('.tooltip .fa').click(function(){
        var active     = $('#layer_achievement_value li:visible a');
        var activeHref = active.attr('href');
        var activeText = active.text();
        var socialHref = '';
        var statusText = encodeURIComponent( activeText + ' ' + activeHref + ' @thegooddata' );

        if($(this).hasClass('fa-facebook')){
          socialHref = 'https://www.facebook.com/sharer/sharer.php?u=' + activeHref;
        }else if($(this).hasClass('fa-twitter')){
          socialHref = 'https://twitter.com/home?status=' + statusText;
        }else if($(this).hasClass('fa-google-plus')){
          socialHref = 'https://plus.google.com/share?url=' + activeHref;
        }
        $that.tooltip('hide');
        TABS_API.create({url: socialHref});
      })
    }).mouseleave(function(){
      setTimeout(function(){
        if(Share.killTooltip){
          $('#layer_achievement_id').tooltip('hide');
          Share.stopSlide = false;
        }
      },500);
    });

    Share.onEventsCalled = true;
  });
}

/* Paints the UI. */
// $( document ).ready(function() {
//   TABS_API.query(
//     {
//       currentWindow: true, 
//       active: true
//     },
//     function(tabs){        
//       TAB_CURRENT = tabs[0];
//       onLoad();
//     }
//   );
// });

(window).addEventListener('load', function() {
    TABS_API.query({currentWindow: true, active: true}, function(tabs) {        
        TAB_CURRENT = tabs[0];
        onLoad();
      });
  },true
);
