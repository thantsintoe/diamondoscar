/* global $ */
/* global jQuery */
/* global Stripe */

$(function() {
    Stripe.setPublishableKey('pk_test_3TqEp6gxWAhM8EG56oNnzknH');
    
    var opts = {
    lines: 13 // The number of lines to draw
    , length: 27 // The length of each line
    , width: 30 // The line thickness
    , radius: 42 // The radius of the inner circle
    , scale: 1 // Scales overall size of the spinner
    , corners: 1 // Corner roundness (0..1)
    , color: '#000' // #rgb or #rrggbb or array of colors
    , opacity: 0.25 // Opacity of the lines
    , rotate: 0 // The rotation offset
    , direction: 1 // 1: clockwise, -1: counterclockwise
    , speed: 1 // Rounds per second
    , trail: 60 // Afterglow percentage
    , fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
    , zIndex: 2e9 // The z-index (defaults to 2000000000)
    , className: 'spinner' // The CSS class to assign to the spinner
    , top: '50%' // Top position relative to parent
    , left: '50%' // Left position relative to parent
    , shadow: false // Whether to render a shadow
    , hwaccel: false // Whether to use hardware acceleration
    , position: 'absolute' // Element positioning
  };
    
    $(document).ready(function () {
        
        var deliveryFee = parseFloat($('#deliveryFee').html()).toFixed(2);
        var totalCharge = parseFloat($('#subTotal').html());
       
        console.log(deliveryFee);    
        console.log(totalCharge);    
            //deliver radio
            
            if ($("#deliverRadio01").is(':checked')) {
               
                $( "input[name='deliveryFee']" ).val(10.0);
            
                
                $('.grandTotal').html(parseFloat(parseFloat(totalCharge) + parseFloat(deliveryFee)).toLocaleString());
                $( "input[name='stripeMoney']" ).val(parseFloat(parseFloat(totalCharge) + parseFloat(deliveryFee)).toFixed(2));
                if($('#addressCity').html==='') {
                    $( ".buyButton" ).attr( "data-target", "#updateAddressWarning" );
                    $( ".confirmButton" ).attr( "data-target", "#updateAddressWarning" );
                }
            }

    });    
    
// Show and hide delivery fee based on delivery option radio
   $(document).ready(function () {
        
        var deliveryFee = parseFloat($('#deliveryFee').html()).toFixed(2);
        var totalCharge = parseFloat($('#subTotal').html()).toFixed(2);
        var grandTotal = parseFloat(parseFloat(totalCharge) + parseFloat($('#deliveryFee')));
        // $('#grandTotal').html(totalCharge);
            
            //deliver radio
            $('#deliverRadio01').click(function () {
                if ($(this).is(':checked')) {
                    grandTotal = parseFloat(parseFloat(totalCharge) + parseFloat($('#deliveryFee')));
                    
                    $('#deliveryFeeRow').slideDown();
                    $( "input[name='deliveryFee']" ).val(10.0);
                    $( "input[name='stripeMoney']" ).val(parseFloat(parseFloat(totalCharge) + parseFloat(deliveryFee)).toFixed(2));
                   
                
                    $('.grandTotal').html(parseFloat(parseFloat(totalCharge) + parseFloat(deliveryFee)).toFixed(2));
                    if($('#addressCity').html==='') {
                        $( ".buyButton" ).attr( "data-target", "#updateAddressWarning" );
                        $( ".confirmButton" ).attr( "data-target", "#updateAddressWarning" );
                    }
                    
                    
                }
            });
            
            //self-collect radio
            $('#deliverRadio02').click(function () {
                if ($(this).is(':checked')) {
                    $('#deliveryFeeRow').slideUp();
                    $( "input[name='deliveryFee']" ).val(0.0);
                    $( "input[name='stripeMoney']" ).val(parseFloat(totalCharge).toFixed(2));
                 
                    
                    $('.grandTotal').html(parseFloat(totalCharge).toFixed(2));
                    $( ".buyButton" ).attr( "data-target", "#stripeModal" );
                    $( ".confirmButton" ).attr( "data-target", "" );
                    
                }
            });
        
    });
    
    $('#paymentRadio01').click(function() {
        if ($(this).is(':checked')) {
            
            $('.buyButton').hide();
            $('.confirmButton').show();
        }
    });
    
     $('#paymentRadio02').click(function() {
        if ($(this).is(':checked')) {
            
            $('.buyButton').show();
            $('.confirmButton').hide();
        }
    });
    
    
    // ======================
  function stripeResponseHandler(status, response) {
    var $form = $('#payment-form');

    if (response.error) {
      // Show the errors on the form
      $form.find('.payment-errors').text(response.error.message);
      $form.find('button').prop('disabled', false);
    } else {
      // response contains id and card, which contains additional card details
      var token = response.id;
      // Insert the token into the form so it gets submitted to the server
      $form.append($('<input type="hidden" name="stripeToken" />').val(token));

      var spinner = new Spinner(opts).spin();
      $('#loading').append(spinner.el);
      // and submit
      $form.get(0).submit();
    }
  }


  $('#payment-form').submit(function(event) {
    var $form = $(this);

    // Disable the submit button to prevent repeated clicks
    $form.find('button').prop('disabled', true);

    Stripe.card.createToken($form, stripeResponseHandler);

    // Prevent the form from submitting with the default action
    return false;
  });
  
  
  $('#edit-address-form').submit(function(event) {
    var $form = $(this);

    // Disable the submit button to prevent repeated clicks
    // $form.find('button').prop('disabled', true);

    var township = document.getElementById("township-selector");
    
    if(township.value === "") {
        alert("Please select a township to update your address. . .");
        // Prevent the form from submitting with the default action
        return false;
    }
    

    
  });
  
  
 
  

});