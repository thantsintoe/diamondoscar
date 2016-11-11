/* global $ */
/* global jQuery */
/* global Stripe */


  $(".all-categories .thumbnail").each(function() {
        $(this).mouseenter(function(){
            $( this ).children( '.caption' ).fadeIn("slow");
        });
  });
  
 $(".all-categories .thumbnail").each(function() {
        $(this).mouseleave(function(){
            $( this ).children( '.caption' ).fadeOut("slow");
        });
  });