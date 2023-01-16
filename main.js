$(document).ready(function(){

  $('.category span').each(function(){
    $(this).click(function(){
      var txtbutton = $(this).attr("id") + "c"
      $("#" + txtbutton).click();
    });
  });

// filter
  $('.category').change(function(){
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
      if ($("#" + theclass1 + "c").is(':checked') || $("#" + theclass2 + "c").is(':checked')){
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

  
});