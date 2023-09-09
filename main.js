$(document).ready(function(){

  $('.category span').each(function(){
    $(this).click(function(){
      var txtbutton = $(this).attr("id") + "c"
      $("#" + txtbutton).click();
    });
  });

  $('#all').click(function(){
    $('.category input[type="checkbox"]').prop("checked", true);
    $('.main').hide();
    $('.filter h2').css("display","inline-block");
  });

  $('#clear').click(function(){
    $('.category input[type="checkbox"]').prop("checked", false);
    $('.main').show();
    $('.filter h2').hide();
  });

// filter

  $('.category').click(function(){
    if ($('input[type="checkbox"]').is(':checked')) {
      $('.main').hide();
      $('.filter').show();
    } else {
      $('.main').show();
      $('.filter').hide();
    };

    $('.filter h2').each(function(){
      var checkt = 0;
      var theclass = $(this).attr("class").split(" ");
      const myArray = theclass;
      var theclass1 = myArray[0];
      var theclass2 = myArray[1];
      var theclass3 = myArray[2];
      var theclass4 = myArray[3];
      if ($("#" + theclass1 + "c").is(':checked') || $("#" + theclass2 + "c").is(':checked') || $("#" + theclass3 + "c").is(':checked') || $("#" + theclass4 + "c").is(':checked')){
        checkt = checkt +1;
      } else {
        checkt = checkt;
      }
      if (checkt >=1){
        $(this).css("display","inline-block");
      } else {
        $(this).hide();
      }
    });
  });

  function filter() {
    if ($('.category input[type="checkbox"]').is(':checked')) {
      $('.category').click();
    } else {};
  }
 
 setTimeout( filter, 1 ); // call "myfunc" after 3 seconds

  
});