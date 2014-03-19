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
  passwordRecoveryRendered: false,
  onEventsCalled : false
}
//Render adtracks in table
function renderAdtracks(tab){
  const TAB = tab;
  const ID = TAB.id;

  const CATEGORY_REQUESTS = (BACKGROUND.REQUEST_COUNTS[ID] || {}).Disconnect || {};
  const DOMAIN = GET(TAB.url);

  const WHITELIST = DESERIALIZE(localStorage.whitelist) || {};
  const SITE_WHITELIST = WHITELIST[DOMAIN] || (WHITELIST[DOMAIN] = {});

  //Clear
  $("#layer_adtracks > tbody").html("");

  //Render header table
  $('#layer_adtracks').append('<tr><th>#</th><th>NAME</th><th>TYPE</th><th>STATUS</th></tr>');

  var i = 0;

  var hAdtracks = new Hash();
  var hAdtracksCount = new Hash();

  for (i in BACKGROUND.ADTRACKS[ID]) 
  {
    var adtrack = BACKGROUND.ADTRACKS[ID][i];
    hAdtracks.setItem(adtrack.service_name, adtrack);

    if (!hAdtracksCount.hasItem(adtrack.service_name))
    {
      hAdtracksCount.setItem(adtrack.service_name,1);
    }
    else
    {
      var count = hAdtracksCount.getItem(adtrack.service_name);
      count++;
      hAdtracksCount.setItem(adtrack.service_name,count);
    }
  }

  //Render Adtracks in GUI
  for (service in hAdtracks.items) 
  {
    var adtrack = hAdtracks.items[service];
    var data_status = false;
    var data_status_value = 'BLOCKED';

    if (SITE_WHITELIST[adtrack.service_name] != undefined)
       data_status=SITE_WHITELIST[adtrack.service_name];

    if (data_status)
       data_status_value = 'BLOCKED';
     else
       data_status_value = 'ALLOWED';
    
    var count =hAdtracksCount.getItem(adtrack.service_name);

    var selector='#layer_adtracks tr:last';
    $(selector).after('<tr><td>'+count+'</td><td>'+adtrack.service_name+'</td><td>'+adtrack.category+'</td><td><div class="btnAdtrack button '+data_status_value.toLowerCase()+'" data-service_name="'+adtrack.service_name+'" data-status="'+data_status+'">'+data_status_value+'</div></td></tr>');
    
    i++;
  }

  //Sort adtracks

  var rows = $('#layer_adtracks tbody  tr').get().splice(1);

  rows.sort(function(a, b) {

    var A = $(a).children().eq(0).text().toUpperCase();
    var B = $(b).children().eq(0).text().toUpperCase();

    if(A < B) {
      return -1;
    }

    if(A > B) {
      return 1;
    }

    return 0;

  });

  $.each(rows, function(index, row) {
    $('#layer_adtracks').children('tbody').append(row);
  });
  

  //Control viewport, hide element unuseful
  if (i>0){
    $('#btnExpandAdtracks').show();
  }
  else{
    $('#btnExpandAdtracks').hide();
  }

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

//Write Achivements values
function writeAchivement(achivements){
  
  var text = '';
  $("#layer_achievement_value").empty();

  for(i = 0; i < achivements.length; i++){
    var achivement = achivements[i];
    $("#layer_achievement_value").append('<li>'+achivement['text'+LANG]+'</li>');
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
  LoadAchievements(writeAchivement);
}


//Write Achivements values
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
  
  if (localStorage.store_navigation == undefined)
    localStorage.store_navigation=true;

  var store_navigation = castBool(localStorage.store_navigation) ;
  setButton(store_navigation,'#layer_config_store_navigation');

  if (localStorage.share_search == undefined)
    localStorage.share_search=true;

  var share_search = castBool(localStorage.share_search);
  setButton(share_search,'#layer_config_share_search');

  if (localStorage.allow_social == undefined)
    localStorage.allow_social=false;

  var allow_social = castBool(localStorage.allow_social);
  setButton(allow_social,'#layer_config_allow_social');

}

//Render Deactivate Current
function renderDeactivateCurrent(DOMAIN,tab){
    var deactivate_current=isDeactivateCurrent(DOMAIN,tab);
    setButton(deactivate_current,'#layer_config_deactivate_current');
}



function deactivateCurrent(tab){
  const TAB = tab;
  const ID = TAB.id;
  const DOMAIN = GET(TAB.url);

  var status=false;
  
  for (i in BACKGROUND.ADTRACKS[ID]) 
  {
    var adtrack = BACKGROUND.ADTRACKS[ID][i];
    addWhitelist(DOMAIN,adtrack.service_name,true);
  }

  return status;

}

function renderHeader(){

  //console.log(localStorage.member_id);
  if (localStorage.member_id != 0){
    $('.username').text(localStorage.member_username);
    $('.authenticated').show();
    $('.anonymous').hide();
  }
  else
  {
    $('.authenticated').hide();
    $('.anonymous').show();
  }
}

function renderPasswordRecovery(){
  var height = $('#login').innerHeight();
  var width = $('#login').innerWidth();

  $('#recover-password')
    .innerHeight(height)
    .innerWidth(width)
    .css({
      'top':-height+'px',
      'left': '0px'
    });
  TGD.passwordRecoveryRendered = true;
}

function onLoad(){
  
  const TAB = TAB_CURRENT;
  const ID = TAB.id;
  const CATEGORY_REQUESTS = (BACKGROUND.REQUEST_COUNTS[ID] || {}).Disconnect || {};
  const DOMAIN = GET(TAB.url);
  const WHITELIST = DESERIALIZE(localStorage.whitelist) || {};
  const SITE_WHITELIST = WHITELIST[DOMAIN] || (WHITELIST[DOMAIN] = {});
  
  //Render Correct Header
  renderHeader();

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
    onEvents();
  }
}

function onEvents()
{
  $( document ).ready(function() {
        
    // Remove focus from links
    $('a').blur();
    
    //Event click button expand adtracks
    $('#btnExpandAdtracks').click(function () {
        if ( $( "#layer_adtracks_expand" ).is( ":hidden" ) ) 
        {
            $( "#layer_adtracks_expand" ).slideDown( "slow" );
            $('#btnExpandAdtracks').removeClass("fa-plus collapsed");
            $('#btnExpandAdtracks').addClass("fa-minus pressed expanded");

        } 
        else 
        {
            $( "#layer_adtracks_expand" ).slideUp( "slow" );
            $('#btnExpandAdtracks').removeClass("fa-minus pressed expanded");
            $('#btnExpandAdtracks').addClass("fa-plus collapsed");
        }

        event.preventDefault();
    });

    //Event click button login
    $('#btnLogin').click(function (event) {
        console.log('clicked');

        if ( $( "#login" ).is( ":hidden" ) ) 
        {
            $("header, #body, footer").hide();
            $( "#login" ).fadeIn( "slow" , function(){
              //Render password recovery form
              if(!TGD.passwordRecoveryRendered){
                renderPasswordRecovery();
              }
            });
        } 
        else 
        {
            $( "#login" ).fadeOut("slow", function(){
              $("header, #body, footer").show();
            });
        }
        event.preventDefault();
        
    });

    $('#sign-in .close').click(function(){
      $('#btnLogin').click();
    })

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

    //Behavior click button signin
    $('#btnSignIn').click(function (event) {
      var username= $('#txtUsername').val();
      var password= $('#txtPassword').val();
      
      $('#pError').html("");

      if (username == "" || password == "")
      {
        $('#pError').html("Invalid username or password.");
      }
      else
      {
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


    //Behavior click Desactivate Current
    $('#not-working').on('click', '.btnDeactivateCurrent', function() { 

      const ID = TAB.id;
      
      var sStatus=$(this).html();
      var status=false;

      if (sStatus == 'ON')
      {
        status=false;
      }
      else if (sStatus == 'OFF')
      {
        status=true

      }

      try
      {
        // for (i in BACKGROUND.ADTRACKS[ID]) 
        // {
        // var adtrack = BACKGROUND.ADTRACKS[ID][i];
        console.log('----> '+'*'+' - '+status);
        setWhitelistStatus(DOMAIN,TAB,'*',status);
        // }

      }
      catch(err)
      {
        console.log(err);
      }
      
      syncWhitelist();

      TABS.reload(ID);

      //Render Options
      renderOptions(TAB);

      //Render deactivate current
      renderDeactivateCurrent(DOMAIN,TAB);

      //Render adtracks in table
      renderAdtracks(TAB);

      event.preventDefault();
    
    });

    //Behavior click Allow Social
    $('#not-working').on('click', '.btnAllowSocial', function() { 
      var allow_social = castBool(localStorage.allow_social);

      allow_social=!allow_social;

      localStorage.allow_social = allow_social;

      //console.log('visualizar '+allow_social);
      renderOptions(TAB);

      addWhitelist(DOMAIN,'Facebook',!allow_social);
      addWhitelist(DOMAIN,'Twitter',!allow_social);
      
      // syncWhitelist();
      
      TABS.reload(ID);
      
      //Render adtracks in table
      renderAdtracks(TAB);

    });

    //Behavior click  StoreNavigation
    $('#level').on('click', '.btnStoreNavigation', function() { 
      var store_navigation = castBool(localStorage.store_navigation);

      store_navigation=!store_navigation;

      localStorage.store_navigation = store_navigation;

      //console.log('visualizar '+store_navigation);
      renderOptions(TAB);


    });

    //Behavior click  StoreNavigation
    $('#level').on('click', '.btnShareSearch', function() { 
      var share_search = castBool(localStorage.share_search);

      share_search = !share_search;

      localStorage.share_search = share_search;

      //console.log('visualizar '+share_search);
      renderOptions(TAB);

    });


    //Behavior click  adtracks
    $('#layer_adtracks').on('click', '.btnAdtrack', function() { 

      var service_name=$(this).data("service_name");
      var status=$(this).data("status");

      addWhitelist(DOMAIN,service_name,status);

      syncWhitelist();
      
      TABS.reload(ID);
      
      //Render adtracks in table
      renderAdtracks(TAB);

      event.preventDefault();

    });

    $('#become-member').on('click', 'button', function(){
      TABS.create({url: URL + '/user/registration'});
    });

    $('#in-love').on('click','.email-us', function(){
    });

    $('#in-love').on('click','.become-owner', function(){
      TABS.create({url: URL + '/user/registration'});
    });

    $('#in-love').on('click','.google-plus', function(){
    });

    $('#in-love').on('click','.donate', function(){
      TABS.create({url: URL + '/site/donate'});
    });

    $('#in-love').on('click','.fa-facebook', function (event){
      //event.preventDefault();
      //TABS.create({url : 'http://www.facebook.com/sharer.php?s=100&p[url]=https://www.thegooddata.org&p[images][0]=https://www.thegooddata.org/img/final-logo-200px.png&p[title]=TheGoodData!&p[summary]=Be in control of your data while doing some good.'});
    });

    $('#in-love').on('click','.twitter', function(){
    });

    $('#header').on('click','#btnLogout', function(){

      localStorage.member_id = 0;
      localStorage.member_username='';
    
      onLoad();
    });

    



    $('body').on('click','a', function(){
      TABS.create({url: this.getAttribute('href')});
      return false;
    });

    // 
    // Behavior tooltips
    //
    
    $('#btnLogin, #btnLogout').tooltip();

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
        $that.tooltip('hide');
      })
    }).mouseleave(function(){
      setTimeout(function(){
        if(TGD.killTooltip){
          $('#layer_achievement_id').tooltip('hide');
          TGD.stopSlide = false;
        }
      },500);
    });

    // Behavior forgot password
    $('#forgotPassword').click(function (){

      if(!$('#recover-password').is(':visible')){
        $('#recover-password').show().animate({'top': '0px'});
      }
      return false;
    });

    // Behavior password recovery close button
    $('#recover-password .close').click(function(e){
      e.stopPropagation();
      var height = $('#recover-password').innerHeight();

      if($('#recover-password').is(':visible')){
        $('#recover-password').show().animate({'top': -height+'px'},400,function(){
          $(this).hide();
        });
      }
      return false;
    });

    // Behavior 'send' button in password recovery
    $('#btnResetPassword').click(function(){
      $(this).html('<i class="fa fa-spinner fa-spin"/>').attr('disabled','disabled');

      /*
       * TODO: Implement the passord resetting process
       *  0 - validate input
       *  1 - make the call
       *  2 - handle response
       *  3 - print output  
       */
    });
    
    TGD.onEventsCalled = true;
  });

  
}

/* Paints the UI. */
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
