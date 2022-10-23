$(document).ready(function(){

  $('#posterc').change(function(){
    if ($(this).is(':checked')) {
        
    };
  });

  if ($(window).width() < 640) {
    $("#caughtmiddle").html("<img src='archive/caught_in_the_middle/final.png' class='pic pica'>")
    $("#caughtmiddle2").html("<img src='final.png' class='pic pica'>")
    $("#altoona").html("<img src='archive/altoona/altoona cover.png' class='pic pica'>")
    $("#midnightblues").html("<img src='archive/midnight_blues_u/cover.png' class='pic pica'>")
  }

});