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
  $('#layer_adtracks').append('<tr><th>NAME</th><th>TYPE</th><th>STATUS</th></tr>');

  var i = 0;

  //Render Adtracks in GUI
  for (i in BACKGROUND.ADTRACKS[ID]) 
  {
    var adtrack = BACKGROUND.ADTRACKS[ID][i];
    var data_status = false;
    var data_status_value = 'BLOCKED';

    if (SITE_WHITELIST[adtrack.service_name] != undefined)
       data_status=SITE_WHITELIST[adtrack.service_name];

    if (data_status)
       data_status_value = 'BLOCKED';
     else
       data_status_value = 'ALLOWED';
    
    var selector='#layer_adtracks tr:last';
    $(selector).after('<tr><td>'+adtrack.service_name+'</td><td>'+adtrack.category+'</td><td><div class="btnAdtrack button '+data_status_value.toLowerCase()+'" data-service_name="'+adtrack.service_name+'" data-status="'+data_status+'">'+data_status_value+'</div></td></tr>');
  
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
  
  sortAndGroupTable('layer_adtracks');


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

  for(i = 0; i < achivements.length; i++){
    var achivement = achivements[i];
    $("#layer_achievement_value").append('<li>'+achivement['text'+LANG]+'</li>');
  }

  var element = $('#layer_achievement_value li'),
      length = element.length, 
      current = 0,
      timeout = 5000;

  function changeSlide() {
      element.eq(current++).fadeOut(300, function(){
          if(current === length){
              current = 0;
          }
          
          element.eq(current).fadeIn(300);
      });
      
      setTimeout(changeSlide, timeout);
  }

  element.slice(1).hide();
  setTimeout(changeSlide, timeout);

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
  $('#layer_usertype_image').attr("src","../images/"+img);
}

//Render Contributed pieces counter in extension
function renderContributed(){
  LoadContributed(writeContributed)
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

function sortAndGroupTable(id){
          var $rows = $('#' + id + ' tr'), // get the table rows
          size = $rows.length, // cache the length
          current = null,
          previous = null,
          bufferLength = 0,
          $buffer = $();

        
        for(var i = 1; i < size; i+=1 ){
          // get current text
          current = $rows.eq(i).find('td').eq(0).html();
          
          if(current != previous ){ 
            // if current text is different from previous text
            // we're changing blocks so te previous block must be 
            // wrapped in a tbody (if it has more than 1 element)
            if(bufferLength > 1){ 
              $buffer.eq(0).prev('.summary').find('td').eq(0).append('&nbsp;(<span>' + bufferLength + '</span>)');
              $buffer
                .wrapAll('<tr/>')
                .wrapAll('<td colspan="3"/>')
                .wrapAll('<table cellspacing="0" />');            
            }
            // empty buffer
            $buffer = $();  
          }else if(bufferLength === 1){
            $('<tr class="summary"><td colspan="2"><div class="caret right"></div>' + current + '</td><td></td></tr>')
              .insertBefore($rows.eq(i-1))
              .click(function(){
                $(this).find('.caret').toggleClass('right bottom');
                $(this).next('tr').slideToggle();
              });
          }

          // add tr to buffer
          $buffer = $buffer.add($rows.eq(i));
          bufferLength = $buffer.length;

          //handle last row scenario
          if(i === (size - 1)){
            if(bufferLength > 1){ 
              $buffer.eq(0).prev('.summary').find('td').eq(0).append('<span>' + bufferLength + '</span>');
              $buffer
              .wrapAll('<tr/>')
              .wrapAll('<td colspan="3"/>')
              .wrapAll('<table cellspacing="0"/>');
            }
          }
          
          // set previous text as current text
          previous = current; 
        }

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
        const TAB = tabs[0];
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
              
              if ( $( "#login" ).is( ":hidden" ) ) 
              {
                  $("header, #body, footer").hide();
                  $( "#login" ).fadeIn( "slow" );
              } 
              else 
              {
                  $( "#login" ).fadeOut("slow", function(){
                    $("header, #body, footer").show();
                  });
              }

              event.preventDefault();
          });

          $('.close').click(function(){
            $('#btnLogin').click();
          })

          //Behavior click button signin
          $('#btnSignIn').click(function (event) {
            var username= $('#txtUsername').val();
            var password= $('#txtPassword').val();
            
            $('#pError').html("");

            if (username == "" || password == "")
            {
              $('#pError').html("Invalid username or password. <a href='"+URL+"/user/recovery'>I forgot my password</a>.");
            }
            else
            {
              loginUser(username,password, 
                function (){
                  
                 $('#btnLogin').click();
                 renderHeader();

                },
                function (error){
                  $('#pError').html("Invalid username or password. <a href='"+URL+"/user/recovery'>I forgot my password</a>.");
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

          $('#in-love').on('click','.email-us', function(){
          });

          $('#in-love').on('click','.become-owner', function(){
          });

          $('#in-love').on('click','.google-plus', function(){
          });

          $('#in-love').on('click','.donate', function(){
          });

          $('#in-love').on('click','.facebook', function(){
          });

          $('#in-love').on('click','.twitter', function(){
          });

          $('#header').on('click','.button_switch', function(){

            localStorage.member_id = 0;
            localStorage.member_username='';
          
            renderHeader();
          });

          



          $('body').on('click','a', function(){
            TABS.create({url: this.getAttribute('href')});
            return false;
          });

          // 
          // tooltip behavior 
          //
          $('#layer_achievement_id').tooltip({
            "html": true, 
            "placement": "left", 
            "trigger": "manual",
            "title": "<i class='fa fa-facebook'></i><i class='fa fa-twitter'></i><i class='fa fa-google-plus'></i>"
          }).mouseenter(function(){
            // cache $(this) for later use inside event handlers
            var $that = $(this);

            // show tooltip
            $that.tooltip('show');

            // hides tootip on mouseleave
            $('.tooltip').mouseleave(function(){
              $that.tooltip('hide');
            });

            // hides tooltip on mouseclick on any of the social icons
            $('.tooltip .fa').click(function(){
              $that.tooltip('hide');
            })
          });
        });
      }
    );

    // if (DESERIALIZE(localStorage.searchHardenable)) {
    //   const SEARCH = document.getElementById('search');
    //   SEARCH.className = 'shown';
    //   const SEARCHBOX = SEARCH.getElementsByTagName('input')[0];
    //   SEARCHBOX.checked = DESERIALIZE(localStorage.searchHardened);

    //   SEARCHBOX.onclick = function() {
    //     SEARCHBOX.checked =
    //         localStorage.searchHardened =
    //             !DESERIALIZE(localStorage.searchHardened);
                
    //     chrome.extension.sendRequest({
    //         sendEvent: 'blimp-change-state',
    //         data: {
    //           hardenedState: DESERIALIZE(localStorage.searchHardened)
    //         }
    //       });
    //   };
    // }

    // const WIFIBOX =
    //     document.getElementById('wifi').getElementsByTagName('input')[0];
    // WIFIBOX.checked = DESERIALIZE(localStorage.browsingHardened);

    // WIFIBOX.onclick = function() {
    //   WIFIBOX.checked =
    //       localStorage.browsingHardened =
    //           !DESERIALIZE(localStorage.browsingHardened);
    // };

    // //PARA VER MENSAJES
    // const BOTON_TEST =
    //     document.getElementById('btnTest');
    
    // BOTON_TEST  .onclick = function() {
    //   var TXT=document.getElementById('txt');
    //   TXT.innerHTML=TXT.innerHTML+"<br>"+JSON.stringify(localStorage);
    // };

  }
  ,
  true
);





/*

layer_loans_value
<div class="content"><img src="img/logo-big.png"/><span id="layer_loans_value" class="green">21</span> projects funded so far<br/>with your help<div class="button share">&nbsp;</div><div class="button add">&nbsp;</div>
*/