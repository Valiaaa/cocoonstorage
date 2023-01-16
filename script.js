$(document).ready(function(){

  $('.navigation').html('<h1><a href="../../index.html">Valia Liu</a></h1><hr><h1 class="category disable"><input type="checkbox" id="albumc"><span id="album">&nbsp Album</span><input type="checkbox" id="posterc"><span id="poster">&nbsp Poster</span><input type="checkbox" id="videoc"><span id="video">&nbsp Video</span><input type="checkbox" id="editorialc"><span id="editorial">&nbsp Editorial</span><input type="checkbox" id="modelingc"><span id="modeling">&nbsp Modeling</span><input type="checkbox" id="brandingc"><span id="branding">&nbsp Branding</span></h1><hr><h1><a href="../../about.html">About</a></h1><h1><a href="mailto:valialiuwork@gmail.com" target="_blank">Email↗</a></h1>')

  $("img").css("margin-bottom","1.2%");
  $("video").css("margin-bottom","1.2%");

  if ($(window).width() < 640) {
    $("img").css({"width":"100%", "margin-bottom":"12px", "float":"none", "display":"block", "margin-left":"0"});
    $("video").css("margin-bottom","12px");
    $(".no").css({"display":"none"});
  }

});