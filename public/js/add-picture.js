/* global $ */
/* global jQuery */

var i = 1;
$('#plus-image').on('click',function(e) {
    e.preventDefault();

      	i = i+1;
      	$("#image_quantity").val(i);
      	$("#picture-input").append("<input type='file' name='newImage"+i+"' required multiple/>");

   
});


var j = 1;
$('#plus-color').on('click',function(e) {
    e.preventDefault();

      	j = j+1;
      	$("#color_quantity").val(j);
      	$(".color-selector").append("<div class='color-group' block'><input type='color' name='color" + j + "' value='#ffffff'><input type='text' class='color_name' name='color_name" + j + "' value='white'></div>");
});

