$(document).ready(function(){

  $('#posterc').change(function(){
    if ($(this).is(':checked')) {
        
    };
  });

  if ($(window).width() < 640) {
    $("#caughtmiddle").html("<img src='archive/caught_in_the_middle/final.png' class='pic pica'>")
  }

  if ($(window).width() < 640) {
    $("#caughtmiddle2").html("<img src='final.png' class='pic pica'>")
  }

});