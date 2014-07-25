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

    Brian Kennish <byoogle@gmail.com>
    Raul Galindo  <rgalindo33@gmail.com>
  
*/

const BACKGROUND = chrome.extension.getBackgroundPage();

/* The domain getter. */
const GET = BACKGROUND.GET;

/* The object deserializer. */
const DESERIALIZE = BACKGROUND.deserialize;

/* The third parties. */
const SERVICES = ['Facebook', 'Google', 'Twitter', 'Yahoo!'];

/* The number of third parties. */
const SERVICE_COUNT = SERVICES.length;

/* The "tabs" API. */
const TABS = BACKGROUND.TABS;

/* The "tabs" API. */
var TAB_CURRENT;

/* global vars in TGD namespace to avoid conflicts */
TGD = {
  killTooltip: true,
  stopSlide : false,
  onEventsCalled : false
}

function renderVersion(){
  var manifest = chrome.runtime.getManifest();
  $('.version').text(manifest.version);
}

//Render adtracks in table
function renderAdtracks(tab) {  
  
  const TAB = tab;
  const ID = TAB.id;

  const CATEGORY_REQUESTS = (BACKGROUND.REQUEST_COUNTS[ID] || {}).Disconnect || {};
  const DOMAIN = GET(TAB.url);

  const WHITELIST = DESERIALIZE(localStorage.whitelist) || {};
  const SITE_WHITELIST = WHITELIST[DOMAIN] || (WHITELIST[DOMAIN] = {});

  //Clear
  //$("#layer_adtracks > tbody").html("");
  $('#layer_adtracks tr').not(function(){if ($(this).has('th').length){return true}}).remove();
      
  //Render header table

  var i = 0;

  var hAdtracks = new Hash();
  var hAdtracksCount = new Hash();

  for (i in BACKGROUND.ADTRACKS[ID]) 
  {
    var adtrack = BACKGROUND.ADTRACKS[ID][i];
    
    var adtrack_key=adtrack.service_name+":"+adtrack.category;
    hAdtracks.setItem(adtrack_key, adtrack);

    if (!hAdtracksCount.hasItem(adtrack_key))
    {
      hAdtracksCount.setItem(adtrack_key,1);
    }
    else
    {
      var count = hAdtracksCount.getItem(adtrack_key);
      count++;
      hAdtracksCount.setItem(adtrack_key,count);
    }
  }

  var deactivate_current = isDeactivateCurrent(DOMAIN,tab);
  console.log(deactivate_current);

  //Render Adtracks in GUI
  for (service in hAdtracks.items) 
  {
    
    // tip: service contains now adtrack.service_name:adtrack.category
    
    var adtrack = hAdtracks.items[service];
    var data_status = false;
    var data_status_value = 'BLOCKED';

// not looking in whitelist anymore, why do it if we've already got that info in the adtrack?
//    // name+category?
//    if (SITE_WHITELIST[service] != undefined)
//       data_status=SITE_WHITELIST[service];

    if (adtrack.status=='allowed') {
      data_status=true;
    }

    if (!data_status)
      data_status_value = 'BLOCKED';
    else
      data_status_value = 'ALLOWED';
    
    var count =hAdtracksCount.getItem(service);

    var selector='#layer_adtracks tr:last';
    
    if (deactivate_current == true) {
      data_status_value = 'ALLOWED';
      data_status=true;
    }
    
    var data_status_text=data_status_value;
    var trading_style='';
    var title='';
    
    if (adtrack.status_extra.statusText) {
      data_status_text=adtrack.status_extra.statusText;
    }
    if (adtrack.status_extra.buttonStyle) {
      trading_style=adtrack.status_extra.buttonStyle;
    }
    if (adtrack.status_extra.buttonTitle) {
      title=adtrack.status_extra.buttonTitle;
    }

    $(selector).after('<tr><td>'+count+'</td><td>'+adtrack.category+'</td><td>'+adtrack.service_name+'</td><td><div title="'+title+'" style="'+trading_style+'" class="'+(deactivate_current?'':'btnAdtrack')+' button '+data_status_value.toLowerCase()+'" data-service_name="'+adtrack.service_name+'" data-category="'+adtrack.category+'" data-status="'+data_status+'">'+data_status_text+'</div></td></tr>');

    i++;
  }

  //Sort adtracks

  function partialSort(arr, start, end, index) {
      var preSorted = arr.slice(0, start), 
          postSorted = arr.slice(end);

      var sorted = arr.slice(start, end).sort(function(a,b){
        var A = $(a).children().eq(index).text().toUpperCase(),
            B = $(b).children().eq(index).text().toUpperCase();
        
        if(A < B) {
          return -1;
        }

        if(A > B) {
          return 1;
        }
        
        return 0;
      });
      arr.length = 0;
      arr.push.apply(arr, preSorted.concat(sorted).concat(postSorted));

      return arr;
  }

  var rows = $('#layer_adtracks tbody  tr').get();
  // sort by number of threads
  rows.sort(function(a, b) {
    var A = parseInt($(a).children().eq(0).text(), 10),
        B = parseInt($(b).children().eq(0).text(), 10);
        

    if(A < B) {
      return 1;
    }

    if(A > B) {
      return -1;
    }
    return 0;
  });

  // group by amount of threats and sort
  var amounts = {}
  $.each(rows, function(index, row){
    var value = parseInt($(row).children().eq(0).text(), 10);
    if(amounts[value] == undefined){
      amounts[value] = 1;
    }else{
      amounts[value] += 1;
    }
  });

  var offset = 0;
  for(key in amounts){
    if(amounts.hasOwnProperty(key)){
      partialSort(rows, offset, offset + amounts[key], 1);
      offset += (amounts[key]);
    }
  }
  
  // group by amount:name
  var amountName = {};
  $.each(rows, function(index, row){
    var value = $(row).children().eq(0).text() + $(row).children().eq(1).text();
    if(amounts[value] == undefined){
      amountName[value] = 1;
    }else{
      amountName[value] += 1;
    }
  });

  var offset = 0;
  for(key in amounts){
    if(amounts.hasOwnProperty(key)){
      partialSort(rows, offset, offset + amounts[key], 2);
      offset += (amounts[key]);
    }
  }

  $.each(rows, function(index, row) {
    $('#layer_adtracks').children('tbody').append(row);
  });

  //Control viewport, hide element unuseful
  // if (i>0){
  //   $('#btnExpandAdtracks').show();
  // }
  // else{
  //   $('#btnExpandAdtracks').hide();
  // }

  if (i==0){
    $('#layer_adtracks').hide();
  }
  else
  {
    $('#layer_adtracks').show();
  }

  //Render elements count
  if (BACKGROUND.ADTRACKS[ID] != undefined){
    var count=BACKGROUND.ADTRACKS[ID].length;
    $('#layer_adtracks_count').html(count);
  }
  
}

//Write Achievements values
function writeAchievement(achievements){
  
  var text = '';
  $("#layer_achievement_value").empty();

  for(i = 0; i < achievements.length; i++){
    var achievement = achievements[i];
    $("#layer_achievement_value").append('<li><p><i></i><a href="'+achievement['link'+LANG]+'" target="_blank">'+achievement['text'+LANG]+'</a></p></li>');
  }

  var element = $('#layer_achievement_value li'),
      length = element.length, 
      current = 0,
      timeout = 5000;

  function changeSlide() {
    if(TGD.stopSlide){
      setTimeout(changeSlide, 1000);
    }else{
      element.eq(current++).fadeOut(300, function(){
          if(current === length){
              current = 0;
          }
          
          element.eq(current).fadeIn(300);
      });
      
      setTimeout(changeSlide, timeout);
    }
  }

  if(element.length > 1){
    element.slice(1).hide();
    setTimeout(changeSlide, timeout); 
  }
}

//Render Achievement in extension
function renderAchievement(){
  LoadAchievements(writeAchievement);
}

//Write Achievements values
function writeQueries(queries){
  $("#layer_achievement_contributions").html(queries.toString());
}

function renderQueries(){
  LoadQueries(writeQueries);
}

function writeLoans(loans){
  $('#layer_loans_value').html(loans);
}

//Render Loans counter in extension
function renderLoans(){
  LoadLoans(writeLoans);
}

function writeContributed(percentil){

  // Apprentice: users that are in the bottom 5% in terms of data items shared last month (unless they are cooperative members)
  // Journeyman: users that are not apprentices nor cooperative members
  // Owner: cooperative members that are in the bottom 20% in terms of data items shared last month (unless they are managers)
  // Expert: cooperative members that are not owners nor managers
  // Collaborator: cooperative members that have participated in the collaboration platform in the last month. Participation includes any kind of activity (posting content or commentaries, voting, setting up or completing tasks, etc)

  var value=parseInt(percentil);
  var is_member=false;

  if (localStorage.member_id != 0){
    value=localStorage.member_id;
    is_member=true;
  }
  
  var text='',img='';

  if (is_member && value < 20)
  {
    img="owner.png";
    text='OWNER';
  }
  else if (is_member && value >= 20)
  {
    img="expert.png";
    text='EXPERT';
  }
  else if (is_member == false && value < 5)
  {
    img="apprentice.png";
    text='APPRENTICE';
  }
  else
  {
    img="journeyman.png";
    text='JOURNEYMAN';
  }

  $('#layer_usertype_title').html(text);
  $('#layer_usertype_image').attr("src","../images/"+img)
    .addClass('icon '+text.toLowerCase());// not every icon is te same so some css styling must be applied.
}

//Render Contributed pieces counter in extension
function renderContributed(){
  LoadContributed(writeContributed);
  if (localStorage.member_id != 0){
    $('#button_delete_stored_data').hide();
  }else{
    $('#button_delete_stored_data').show();
  }
}

function setButtonOn(id){
  $(id).html('ON');
  $(id).removeClass('off');
  $(id).addClass('on');
}

function setButtonOff(id){
  $(id).html('OFF');

  $(id).removeClass('on');
  $(id).addClass('off');
}

function setButton(status, id){
  if (status==true)
  {
    setButtonOn(id);
  }
  else
  {
    setButtonOff(id);
  }
}

//Render Contributed pieces counter in extension
function renderOptions(tab){
  // store navigation and non-sensitive queries?
  if (localStorage.store_navigation == undefined) {
    localStorage.store_navigation=true;
  }

  var store_navigation = castBool(localStorage.store_navigation) ;
  setButton(store_navigation,'#layer_config_store_navigation');

  // Trade non-sensitive queries?
  if (localStorage.share_search == undefined) {
    localStorage.share_search=true;
  }

  var share_search = castBool(localStorage.share_search);
  setButton(share_search,'#layer_config_share_search');

  // Allow social networks?
  if (localStorage.allow_social == undefined) {
    localStorage.allow_social=false;
  }

  var allow_social = castBool(localStorage.allow_social);
  setButton(allow_social,'#layer_config_allow_social');
}

//Render Deactivate Current
function renderDeactivateCurrent(DOMAIN,tab){
    var deactivate_current=isDeactivateCurrent(DOMAIN,tab);
    setButton(deactivate_current,'#layer_config_deactivate_current');
}

// TODO: is this function used by any one?
function deactivateCurrent(tab){
  const TAB = tab;
  const ID = TAB.id;
  const DOMAIN = GET(TAB.url);

  var status=false;
  
  for (i in BACKGROUND.ADTRACKS[ID]) 
  {
    var adtrack = BACKGROUND.ADTRACKS[ID][i];
    addWhitelist(DOMAIN,adtrack.service_name,adtrack.category,true);
  }

  return status;
}

function renderHeader(){

  //console.log(localStorage.member_id);
  if (localStorage.member_id != 0){
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

function renderLinks(){
  $('#forgotPassword').attr('href',URL+'/user/recovery');
  $('#moreStats').attr('href',URL+'/evilData');
  $('#moreAchievements').attr('href',URL+'/goodData');
  $('#moreProjects').attr('href',URL+'/goodData');
  $('#moreAboutYou').attr('href',URL+'/userData');
}

function onLoad(){
    
  const TAB = TAB_CURRENT;
  const ID = TAB.id;
  const CATEGORY_REQUESTS = (BACKGROUND.REQUEST_COUNTS[ID] || {}).Disconnect || {};
  const DOMAIN = GET(TAB.url);
  const WHITELIST = DESERIALIZE(localStorage.whitelist) || {};
  const SITE_WHITELIST = WHITELIST[DOMAIN] || (WHITELIST[DOMAIN] = {});
  
  //Render links
  renderLinks();

  //Render Correct Header
  renderHeader();

  //Render version
  renderVersion();

  //Render adtracks in table
  renderAdtracks(TAB);

  // //Render achievement
  renderAchievement();

  // //Render loans counter
  renderLoans();

  // //Render Queries counter
  renderQueries();

  // //Render Contributed counter
  renderContributed();

  //Render Options
  renderOptions(TAB);

  //Render deactivate current
  renderDeactivateCurrent(DOMAIN,TAB);

  // onEvents is called multiple times during extension execution.
  // This causes event handlers being attached more than once to an element
  // resulting in undesired behaviour.
  // TODO: This needs to be fixed
  if(!TGD.onEventsCalled){
    onEvents(DOMAIN, TAB);
  }
}

function onEvents(DOMAIN, TAB)
{
  $( document ).ready(function() {
        
    // Remove focus from links
    $('a').blur();
    
    //Event click button "expand adtracks"
    $('#btnExpandAdtracks').click(function () {
        if ( $( "#layer_adtracks_expand" ).is( ":hidden" ) ) {
            // $( "#layer_adtracks_expand" ).slideDown( "slow" );
            $( "#layer_adtracks_expand" ).show();
            $('#btnExpandAdtracks').removeClass("fa-plus collapsed");
            $('#btnExpandAdtracks').addClass("fa-minus expanded");

        } else {
            // $( "#layer_adtracks_expand" ).slideUp( "slow" );
            $( "#layer_adtracks_expand" ).hide();
            $('#btnExpandAdtracks').removeClass("fa-minus expanded");
            $('#btnExpandAdtracks').addClass("fa-plus collapsed");
        }
        event.preventDefault();
    });

    //Event click button "show sign-in form"
    $('#btnLogin').click(function (event) {

        if ( $( "#sign-in" ).is( ":hidden" ) ) {
            $("#content").hide();
            $( "#sign-in" ).fadeIn( "slow");
        } else {
            $( "#sign-in" ).fadeOut("slow", function(){
              $("#content").show();
            });
        }
        event.preventDefault();  
    });

    // Event click button "close sign-in form"
    $('#sign-in .close').click(function(){
      $('#btnLogin').click();
    })

    // Event click button "delete stored data"
    $('.deleteQueries').click(function(){
      deleteQueries(
        function(data){
          chrome.tabs.getCurrent(function (tab){
            localStorage.user_id = createUUID();
            onLoad(tab);
          })
        },
        function (error){
        }
      );
    });

    // Event click button "sign in"
    $('#btnSignIn').click(function (event) {
      var username= $('#txtUsername').val();
      var password= $('#txtPassword').val();
      
      $('#pError').html("");

      if (username == "" || password == "") {
        $('#pError').html("Invalid username or password.");
      } else {
        loginUser(username,password, 
          function (){
            $('#btnLogin').click();
            $('#txtUsername').val('');
            $('#txtUsername').val('');
            onLoad();
          },
          function (error){
            $('#pError').html("Invalid username or password.");
          }
        );
      }
      event.preventDefault();
    });


    // Event click button "Deactivate Current"
    $('#not-working').on('click', '.btnDeactivateCurrent', function() { 

      const ID = TAB.id;

      var sStatus=$(this).html();
      var status=false;

      if (sStatus == 'ON') {
        status=false;
      }else if (sStatus == 'OFF') {
        status=true
      }

      try {
        // for (i in BACKGROUND.ADTRACKS[ID]) 
        // {
        // var adtrack = BACKGROUND.ADTRACKS[ID][i];
        console.log('----> '+'*'+' - '+status);
        // TODO: Test if this is working properly since adding category.
        setWhitelistStatus(DOMAIN,TAB,'*','*',status);
        // }
      } catch(err) {
        console.log(err);
      }

      
      syncWhitelist();

      TABS.reload(ID);

      //Render Options
      renderOptions(TAB);

      //Render deactivate current
      renderDeactivateCurrent(DOMAIN,TAB);

//      //Render adtracks in table
//      renderAdtracks(TAB);

      // Temp fix closing window so it will render new stats when opening again.
      window.close();

      event.preventDefault();
    
    });

    // Event click button "Allow Social"
    $('#not-working').on('click', '.btnAllowSocial', function() { 
      var allow_social = castBool(localStorage.allow_social);
      const ID = TAB.id;

      allow_social = !allow_social;

      localStorage.allow_social = allow_social;

      //console.log('visualizar '+allow_social);
      renderOptions(TAB);

      addWhitelist(DOMAIN,'Facebook','Social',!allow_social);
      addWhitelist(DOMAIN,'Twitter','Social',!allow_social);
      
      // syncWhitelist();
      
      TABS.reload(ID);
      
//      //Render adtracks in table
//      renderAdtracks(TAB);
      
      // Temp fix closing window so it will render new stats when opening again.
      window.close();
      
    });

    // Event click button "Store Navigation"
    $('#level').on('click', '.btnStoreNavigation', function() { 
      var store_navigation = castBool(localStorage.store_navigation);

      store_navigation=!store_navigation;

      localStorage.store_navigation = store_navigation;

      //console.log('visualizar '+store_navigation);
      renderOptions(TAB);
    });

    // Event click button "Trade non-sensitive queries"
    $('#level').on('click', '.btnShareSearch', function() { 
      var share_search = castBool(localStorage.share_search);

      share_search = !share_search;

      localStorage.share_search = share_search;

      //console.log('visualizar '+share_search);
//      renderOptions(TAB);
      
      const ID = TAB.id;
      
      TABS.reload(ID);
      
      // Temp fix closing window so it will render new stats when opening again.
      window.close();
      
    });

    // Event click button "blocked / allowed"
    $('#layer_adtracks').on('click', '.btnAdtrack', function() { 
      const ID = TAB.id;

      var service_name=$(this).data("service_name");
      var status=$(this).data("status");
      var category=$(this).data("category");

      addWhitelist(DOMAIN,service_name,category,status);

      syncWhitelist();
      
      TABS.reload(ID);
      
      // Temp fix closing window so it will render new stats when opening again.
      window.close();
      
//      //Render adtracks in table
//      renderAdtracks(TAB);
      
//      //Render
//      onLoad();

      event.preventDefault();
    });
    
    // Reset preferences for all sites / clear whitelist
    $('#reset_site_pref').on('click', function() { 
      
      
      if (confirm("Do you want to reset preferences for all the sites?")) {
        resetEntireWhitelist();
        
        alert("Local whitelist has been reset!");
        
        const ID = TAB.id;
      
        syncWhitelist();

        TABS.reload(ID);

        // Temp fix closing window so it will render new stats when opening again.
        window.close();
        
        event.preventDefault();
        
        return false;
        
      }
      
    });
    
    $('#btnAdvancedSettings').on('click', function() { 
      $('#body .body_main').hide();
      $('#footer').hide();
      $('#body .body_advanced_settings').show();
      event.preventDefault();
      return false;
    });
    $('#btnAdvancedSettings_return').on('click', function() { 
      $('#body .body_main').show();
      $('#footer').show();
      $('#body .body_advanced_settings').hide();
      event.preventDefault();
      return false;
    });

    // Event click button "BECOME A MEMBER"
    $('#become-member').click(function(){
      TABS.create({url: URL + '/apply'});
    });

    // Event click button "Email us"
    $('#in-love').on('click','.email-us', function(){
    });

    // Event click button "Become owner"
    $('#in-love').on('click','.become-owner', function(){
      TABS.create({url: URL + '/user/registration'});
      return false;
    });

    // Event click button "Share on G+"
    $('#in-love').on('click','.google-plus', function(){
    });

    // Event click button "Donate"
    $('#in-love').on('click','.donate', function(){
      TABS.create({url: URL + '/donate'});
      return false;
    });

    // Event click button "Share on FB"
    $('#in-love').on('click','.fa-facebook', function (event){
      //event.preventDefault();
      //TABS.create({url : 'http://www.facebook.com/sharer.php?s=100&p[url]=https://www.thegooddata.org&p[images][0]=https://www.thegooddata.org/img/final-logo-200px.png&p[title]=TheGoodData!&p[summary]=Be in control of your data while doing some good.'});
    });

    // Event click button "Share on Twitter"
    $('#in-love').on('click','.twitter', function(){
    });

    // Event click button "Sign out"
    $('#header').on('click','#btnLogout', function(){
      localStorage.member_id = 0;
      localStorage.member_username='';
    
      $.get( URL+"/user/logout", function( data ) {
      });

      onLoad();
    });

    // Event click on any link
    $('body a').not('.more-inner').click(function(){
      TABS.create({url: this.getAttribute('href')});
      return false;
    });

    $('.more a').click(function(){
      TABS.create({url: URL + '/' + $(this).data('target')});
      return false;
    })

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
      TGD.stopSlide = true;

      // hides tootip on mouseleave
      $('.tooltip').mouseleave(function(){
        $that.tooltip('hide');
        TGD.killTooltip = true;
        TGD.stopSlide = false;
      }).mouseenter(function(){
        TGD.killTooltip = false;
      });

      // hides tooltip on mouseclick on any of the social icons
      $('.tooltip .fa').click(function(){
        var active     = $('#layer_achievement_value li:visible a');
        var activeHref = active.attr('href'),
            activeText = active.text(),
            socialHref = '',
            statusText = encodeURIComponent( activeText + ' ' + activeHref + ' @thegooddata' );

        if($(this).hasClass('fa-facebook')){
          socialHref = 'https://www.facebook.com/sharer/sharer.php?u=' + activeHref;
        }else if($(this).hasClass('fa-twitter')){
          socialHref = 'https://twitter.com/home?status=' + statusText;
        }else if($(this).hasClass('fa-google-plus')){
          socialHref = 'https://plus.google.com/share?url=' + activeHref;
        }
        $that.tooltip('hide');
        TABS.create({url: socialHref});
      })
    }).mouseleave(function(){
      setTimeout(function(){
        if(TGD.killTooltip){
          $('#layer_achievement_id').tooltip('hide');
          TGD.stopSlide = false;
        }
      },500);
    });

    TGD.onEventsCalled = true;
  });
}

/* Paints the UI. */
// $( document ).ready(function() {
//   TABS.query(
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

(window).addEventListener(
  'load', function() 
  {
    TABS.query
    (
      {
        currentWindow: true, 
        active: true
      }
      , 
      function(tabs) 
      {        
        TAB_CURRENT = tabs[0];
        onLoad();
      }
    );
  }
  ,
  true
);
