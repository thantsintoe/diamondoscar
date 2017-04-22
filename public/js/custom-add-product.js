/* global $ */
/* global jQuery */
/* global Stripe */



 

//====================================
//      Form Validation
//====================================

 
  $('#uploadForm').submit(function(event) {
    // Disable the submit button to prevent repeated clicks:
    
    // $form.find('.submit').prop('disabled', true);

    var str_en = $('input[name="name_en"]').val();
    var str_mm = $('input[name="name_en"]').val();
    var price = $('input[name="price"]').val();
    var discount_price = $('input[name="discount_price"]').val();
    
    
    if(/^[a-zA-Z0-9- ]*$/.test(str_en) == false | /^[a-zA-Z0-9- ]*$/.test(str_mm) == false) {
        
        // Prevent the form from being submitted:
        event.preventDefault();
        $('#add-product-alert').html('<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>Product Name must not contain Special Characters !');
        $("#add-product-alert").show();
        window.scrollTo(0, 0);
        
    } else if(/^[a-zA-Z0-9- ]*$/.test(price) == false | /^[a-zA-Z0-9- ]*$/.test(discount_price) == false) {
        
        event.preventDefault();
        $('#add-product-alert').html('<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>Prouct Prices must be digit only !');
        $("#add-product-alert").show();
        window.scrollTo(0, 0);
    }

  });



