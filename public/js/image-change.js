/* global $ */
/* global jQuery */


$(".thumbnail").mouseenter(function(){
    var image = $(this).children( "input[name='source2']" ).val();
    $(this).find('img').attr( "src",image);
});

$(".thumbnail").mouseleave(function(){
    var image = $(this).children( "input[name='source1']" ).val();
    $(this).find('img').attr( "src",image);
});



