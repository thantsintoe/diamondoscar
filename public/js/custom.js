/* global $ */
/* global jQuery */
/* global Stripe */

$(function() {

  Stripe.setPublishableKey('pk_test_3TqEp6gxWAhM8EG56oNnzknH');

$('#plus').on('click',function(e) {
    e.preventDefault();
    var originalPrice = parseFloat($('#originalPrice').val());
    var quantity = parseInt($('#quantity').val());
    var currentLanguage = $('#lg-setting').val();
    
    quantity = quantity + 1;
    
    $('#quantity').val(quantity);
    $('#priceHidden').val((originalPrice.toFixed(2)*quantity).toFixed(2));
    
    $('#total').html(quantity);
    
    if (currentLanguage == 'mm')
        $('#priceValue').html('စုစုပေါင်း ကျသင့်ငွေ - $ ' + (originalPrice.toFixed(2)*quantity).toFixed(2));
    else {
        $('#priceValue').html('Total Price - $ ' + (originalPrice.toFixed(2)*quantity).toFixed(2));  
    }
    
    


});


$('#minus').on('click',function(e) {
    e.preventDefault();
    var originalPrice = parseFloat($('#originalPrice').val());
    var quantity = parseInt($('#quantity').val());
    var currentLanguage = $('#lg-setting').val();
    
    if(quantity === 1) {
        $('#quantity').val(quantity);
        $('#priceHidden').val((originalPrice.toFixed(2)*quantity).toFixed(2));
        
        $('#priceValue').val((originalPrice.toFixed(2)*quantity).toFixed(2));

        
        
    } else {
        quantity = quantity - 1;

         $('#quantity').val(quantity);
         $('#priceHidden').val((originalPrice.toFixed(2)*quantity).toFixed(2));
    
         $('#total').html(quantity);
         
         if (currentLanguage == 'mm') {
            $('#priceValue').html('စုစုပေါင်း ကျသင့်ငွေ - $ ' + (originalPrice.toFixed(2)*quantity).toFixed(2));
         } else {
            $('#priceValue').html('Total Price - $ ' + (originalPrice.toFixed(2)*quantity).toFixed(2)); 
         }
    }

});


$('.size-buttons').on('click',function(e) {
    e.preventDefault();
    $(".size-buttons").removeClass('active-size');
   
      this.classList.add('active-size');
      $('#selected-size').val(this.textContent);
   
});

$('.color-circle').on('click',function(e) {
    e.preventDefault();
    $(".color-circle").removeClass('active-color');
   
      this.classList.add('active-color');
      $('#selected-color-no').val($(this).val());
   
});


/*Aside Show and Hide Toggle*/

    $('#men-plus-button').click(function() {
        if ( $("#men-plus-group").is( ":hidden" ) ) {
            $( "#men-plus-group" ).slideDown( "slow" );
            $( "#men-plus-button" ).toggleClass( "glyphicon-minus-sign" );
         } else {
            $( "#men-plus-group" ).hide('slow');
            $( "#men-plus-button" ).removeClass( "glyphicon-minus-sign" );
         }
    });
    
    $('#women-plus-button').click(function() {
        if ( $("#women-plus-group").is( ":hidden" ) ) {
            $( "#women-plus-group" ).slideDown( "slow" );
            $( "#women-plus-button" ).toggleClass( "glyphicon-minus-sign" );
         } else {
            $( "#women-plus-group" ).hide('slow');
            $( "#women-plus-button" ).removeClass( "glyphicon-minus-sign" );
         }
    });
    
    $('#bags-plus-button').click(function() {
        if ( $("#bags-plus-group").is( ":hidden" ) ) {
            $( "#bags-plus-group" ).slideDown( "slow" );
            $( "#bags-plus-button" ).toggleClass( "glyphicon-minus-sign" );
         } else {
            $( "#bags-plus-group" ).hide('slow');
            $( "#bags-plus-button" ).removeClass( "glyphicon-minus-sign" );
         }
    });
    
    $('#shoes-plus-button').click(function() {
        if ( $("#shoes-plus-group").is( ":hidden" ) ) {
            $( "#shoes-plus-group" ).slideDown( "slow" );
            $( "#shoes-plus-button" ).toggleClass( "glyphicon-minus-sign" );
         } else {
            $( "#shoes-plus-group" ).hide('slow');
            $( "#shoes-plus-button" ).removeClass( "glyphicon-minus-sign" );
         }
    });
    
    $('#jewellery-plus-button').click(function() {
        if ( $("#jewellery-plus-group").is( ":hidden" ) ) {
            $( "#jewellery-plus-group" ).slideDown( "slow" );
            $( "#jewellery-plus-button" ).toggleClass( "glyphicon-minus-sign" );
         } else {
            $( "#jewellery-plus-group" ).hide('slow');
            $( "#jewellery-plus-button" ).removeClass( "glyphicon-minus-sign" );
         }
    });

//Toggle Burmese Class when language is changed
 $(document).ready(function(){
    
    var currentLanguage = $('#lg-setting').val();
    
    if(currentLanguage === "en") {
        $('.multilanguage').removeClass("burmese"); 
    }

});



function stripeResponseHandler(status, response) {
  // Grab the form:
  var $form = $('#payment-form');

  if (response.error) { // Problem!
    console.log(response.id);
    console.log(response.error);
    // Show the errors on the form:
    $form.find('.payment-errors').text(response.error.message);
    $form.find('.submit').prop('disabled', false); // Re-enable submission

  } else { // Token was created!

    // Get the token ID:
    var token = response.id;

    // Insert the token ID into the form so it gets submitted to the server:
    $form.append($('<input type="hidden" name="stripeToken">').val(token));

    // Submit the form:
    $form.get(0).submit();
  }
}


  $('#payment-form').submit(function(event) {
    var $form = $(this);
    alert('payment-form event is triggered');

    // Disable the submit button to prevent repeated clicks
    $form.find('button').prop('disabled', true);

    Stripe.card.createToken($form, stripeResponseHandler);

    // Prevent the form from submitting with the default action
    return false;
  });


});