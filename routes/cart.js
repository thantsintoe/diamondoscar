var express = require('express');
var router = express.Router();
var methodOverride = require('method-override');
var async = require('async');
var nodemailer          = require("nodemailer");
var ejs                 = require('ejs');

var Order = require('../models/order');
var User = require('../models/user');
var middleware = require('../middleware/middleware');
var stripe = require('stripe')('sk_test_Pl3BaXGf0zSf8zyX6biMIAcn');

router.use(methodOverride("_method"));

//========================================
//POST route to add the product to user's CART
//========================================

router.post('/cart/product/:product_id', middleware.isLoggedIn, function(req, res) {

  async.waterfall([function(callback) {

    Order.findOne({
      $and: [{
        user: req.user._id
      }, {
        status: 'CART'
      }]
    }, function(err, order) {
      if (err) {
        console.log(err);
        console.log('Cannot Find order owned by User ' + req.user.username.en);
        req.flash('error','Internal Server Error...We apologise.');
        return res.redirect('back');
      }
      if (order) {
        // console.log(order);
        callback(null);
      }
      else {
        var order = new Order();

        order.user = req.user._id;
        order.status = 'CART';

        order.save(function(err) {
          if (err) {
            console.log(err);
            req.flash('error','Internal Server Error...We apologise.');
            return res.redirect('/category/all/1');
          }
          callback(null);
        });
      }
    });

     }, function(callback) {
    Order.findOne({
      $and: [{
        user: req.user._id
      }, {
        status: 'CART'
      }]
    }, function(err, order) {
      if (err) console.log(err);
      
      order.line_items.push({
        item: req.body.product_id,
        quantity: req.body.quantity,
        size: req.body.selected_size,
        color: parseInt(req.body.selected_color_no),
        price: parseFloat(req.body.priceHidden)
      });

      order.total_price = (order.total_price + parseFloat(req.body.priceHidden)).toFixed(2);
      order.status = 'CART';

      order.save(function(err) {
        if (err) {
          console.log('Error while trying to save updated Cart');
          console.log(err);
          req.flash('error','Internal Server Error...We apologise.');
          return res.redirect('/category/all/1');
        }
        else {
          // console.log(order);
          req.flash('success','Successfully added the product to your Shopping Cart !');
          return res.redirect('/cart');
        }
      });
    });
     }]);
});


//========================================
//GET route to render cart.html
//========================================
router.get('/cart', middleware.isLoggedIn, function(req, res, next) {
  Order.findOne({
      $and: [{
        user: req.user._id
      }, {
        status: 'CART'
      }]
    })
    .populate('line_items.item')
    .exec(function(err, foundOrder) {
      if (err) {
        console.log(err);
        return next(err);
      }
      res.render('index/cart', {
        order: foundOrder
      });
    });
});


//========================================
//DELETE route to delete the product from user's CART
//========================================
router.delete('/cart', middleware.isLoggedIn, function(req, res, next) {

  Order.findOne({
    $and: [{
      user: req.user._id
    }, {
      status: 'CART'
    }]
  }, function(err, foundOrder) {
    if (err) return next(err);
    foundOrder.line_items.pull(String(req.body.item));

    foundOrder.total_price = (foundOrder.total_price - parseFloat(req.body.price)).toFixed(2);
    foundOrder.save(function(err, found) {
      if (err) return next(err);
      req.flash('success','Successfully removed Product from your Shopping Cart !');
      res.redirect('/cart');
    });
  });
});


//========================================
//POST route to submit credit card payment info to server
//========================================
router.post('/payment-card', middleware.isLoggedIn, function(req, res, next) {

  var stripeToken = req.body.stripeToken;
  var currentCharges = Math.round(req.body.stripeMoney * 100);
  var deliveryFee = parseFloat(req.body.deliveryFee);
  var grandTotal = parseFloat(req.body.stripeMoney);
  
  var smtpTransport = nodemailer.createTransport("SMTP",{
      host: 'smtp.gmail.com',
      secureConnection: false,
      port: 587,
      auth: {
          user: 'mr.thantsintoe@gmail.com', //Sender Email id
          pass: 'Patoe149201031' //Sender Email Password
      }
  });

  stripe.customers.create({source: stripeToken,})
  .then(function(customer) {
    return stripe.charges.create({
      amount: currentCharges,
      currency: 'sgd',
      customer: customer.id
    });
  }).then(function(charge) {
    async.waterfall([
      function(callback) {

        Order.findOne({
          $and: [{
            user: req.user._id
          }, {
            status: 'CART'
          }]
        }, function(err, order) {
          if (err) {
            console.log('Cannot find order for the user.');
            console.log(err);
            return next();
          }
          callback(err, order);
        });
      },
      function(order, callback) {
        User.findOne({
          _id: req.user._id
        }, function(err, user) {
          if (err) {
            console.log('Cannot find user');
            console.log(err);
            return next();
          }

          if (user) {
            for (var i = 0; i < order.line_items.length; i++) {
              user.history.push({
                item: order.line_items[i].item,
                paid: order.line_items[i].price
              });
            }

            user.save(function(err, user) {
              if (err) return next(err);
              callback(err, user);
            });
          }
        });
      },
      function(user, callback) {

        var d = new Date();
        var todayDate = d.toDateString();

        Order.findOne({$and: [{user: req.user._id}, {status: 'CART'}]})
        .populate('line_items.item')
        .exec(function(err, foundOrder) {
              if (err) {
                console.log('Cannot find order');
                console.log(err);
                return next();
              }
              
              foundOrder.status = 'CONFIRM';
              foundOrder.order_date = todayDate;
              foundOrder.delivery_fee = deliveryFee;
              foundOrder.grand_total = grandTotal;
              foundOrder.payment_option = "Cash On Delivery";
              
              foundOrder.markModified('status');
              foundOrder.markModified('order_date');
              foundOrder.markModified('delivery_fee');
              foundOrder.markModified('grand_total');
              foundOrder.markModified('payment_option');
              foundOrder.save(function(err,order) {
                if(err) {
                  console.log('Error while trying to process the payment!');
                  console.log(err);
                } else {
                  
                  callback(null, order,user);
                }
              });
          });
      }
      ,function(order,user,callback) {
    
        console.log(order);
        
        ejs.renderFile('views/emails/orderSummary.ejs',{user: user,order: order},function(err,html) {
            if(err) console.log(err);
            callback(null,order,user,html);
        });
        
      },function(order,user,html,callback) {
        
        var mailOptions = {
            from: 'mr.thantsintoe@gmail.com',
            to: user.email, 
            subject: 'Your Order is confirmed, Thank you !', 
            html: html
        };
        
    
        smtpTransport.sendMail(mailOptions, function(error, response){
            if(error){
                console.log(error);
                res.end("error");
            } else {
                console.log("Message sent");
                callback(null,user);
            }
        });
      },
      function(user,callback) {
        Order.find({}, function(err , foundOrders){
          if(err) {
            console.log(err);
          }
          
          var currentNumOfOrder = foundOrders.length;
          
          callback(null, user,currentNumOfOrder);
        });
      },
      function(user,currentNumOfOrder) {
        var order = new Order();
        var newOrderNum = 20001 + currentNumOfOrder;
        
        order.user = user._id;
        order.status = 'CART';
        order.order_code = "OD " + newOrderNum;
    
        order.save(function(err,savedOrder) {
          if (err) {
            console.log(err);
            req.flash('error','Internal Server Error...We apologise.');
            return res.redirect('/category/all/1');
          }
          console.log("New order successfully created as follow: ");
          console.log(savedOrder);
          req.flash('success','Your Order is successful! Thank you, we will deliver to you soon !');
          res.redirect('/profile');
        });

      }
          ]);
  });

});




//========================================
//POST route to submit Cash on Delivery info to server
//========================================
router.post('/payment-cash', middleware.isLoggedIn, function(req, res, next) {

  var smtpTransport = nodemailer.createTransport("SMTP",{
      host: 'smtp.gmail.com',
      secureConnection: false,
      port: 587,
      auth: {
          user: 'mr.thantsintoe@gmail.com', //Sender Email id
          pass: 'Patoe149201031' //Sender Email Password
      }
  });
  
  
  var deliveryFee = parseFloat(req.body.deliveryFee);
  var grandTotal = parseFloat(req.body.stripeMoney);

  async.waterfall([function(callback) {

      Order.findOne({$and: [{user: req.user._id}, {status: 'CART'}]})
      .populate('line_items.item')
      .exec(function(err,order) {
          if (err) {
            console.log('Cannot find order for the user.');
            console.log(err);
            return next();
          }
          // console.log("Order.lineitems.item is ");
          // console.log(order.line_items[0].item.name);
          
          callback(err, order);
      });
  },function(order, callback) {
      
      User.findOne({_id: req.user._id}, function(err, user) {
        
        if (err) {
          console.log('Cannot find user');
          console.log(err);
          return next();
        }

        if (user) {
          for (var i = 0; i < order.line_items.length; i++) {
            user.history.push({
              item: order.line_items[i].item,
              paid: order.line_items[i].price
            });
          }

          user.save(function(err, user) {
            if (err) return next(err);
            callback(err, user);
          });
        }
      });
  },function(user, callback) {
      
      var d = new Date();
      var todayDate = d.toDateString();
      // Order.update({ user: user._id }, { $set: { line_items: [], total_price: 0,status: 'PAID' }}, function(err, updated) {
      Order.findOne({$and: [{user: req.user._id}, {status: 'CART'}]})
      .populate('line_items.item')
      .exec(function(err, foundOrder) {
            if (err) {
              console.log('Cannot find order');
              console.log(err);
              return next();
            }
            
            foundOrder.status = 'CONFIRM';
            foundOrder.order_date = todayDate;
            foundOrder.delivery_fee = deliveryFee;
            foundOrder.grand_total = grandTotal;
            foundOrder.payment_option = "Cash On Delivery";
            
            foundOrder.markModified('status');
            foundOrder.markModified('order_date');
            foundOrder.markModified('delivery_fee');
            foundOrder.markModified('grand_total');
            foundOrder.markModified('payment_option');
            foundOrder.save(function(err,order) {
              if(err) {
                console.log('Error while trying to process the payment!');
                console.log(err);
              } else {
                
                callback(err, order,user);
              }
            });
        });
  },function(order,user,callback) {
    
    ejs.renderFile('views/emails/orderSummary.ejs',{user: user,order: order},function(err,html) {
        if(err) console.log(err);
        callback(null,order,user,html);
    });
    
  },function(order,user,html,callback) {
    
    var mailOptions = {
        from: 'mr.thantsintoe@gmail.com',
        to: user.email, 
        subject: 'Your Order is confirmed, Thank you !', 
        html: html
    };
    

    smtpTransport.sendMail(mailOptions, function(error, response){
        if(error){
            console.log(error);
            res.end("error");
        } else {
            console.log("Message sent");
            callback(null,user);
        }
    });
  }
  ,
  function(user,callback) {
    Order.find({}, function(err , foundOrders){
      if(err) {
        console.log(err);
      }
      
      var currentNumOfOrder = foundOrders.length;
      
      callback(null, user,currentNumOfOrder);
    });
  }
  ,function(user,currentNumOfOrder) {
      
      var order = new Order();
      var newOrderNum = 20001 + currentNumOfOrder;
      
      order.user = user._id;
      order.status = 'CART';
      order.order_code = "OD " + newOrderNum;

      order.save(function(err,savedOrder) {
        if (err) {
          console.log(err);
          req.flash('error','Internal Server Error...We apologise.');
          return res.redirect('/category/all/1');
        }
        
        // console.log('New order successfully createt as follow: ');
        // console.log(savedOrder);
        req.flash('success','Your Order is successful ! Thank you, we will deliver to you soon !');
        res.redirect('/profile');
      });
  }
]);


});


//========================================
//Update Product ID
//========================================

// router.get('/update-order-id', function(req, res) {
    
//     Order.find({},function(err,foundOrders) {
      
//       if(err) {console.log('Cannot find Products');}
       
//       for(var i = 0; i<foundOrders.length; i++) {
//           var temp_j = 20001 + i;
//           foundOrders[i].order_code = "OD " + temp_j;
//           foundOrders[i].markModified('order_code');
//           foundOrders[i].save(function(err,savedOrder) {
//               if(err) {console.log('cannot save order');}
//               console.log(savedOrder);
//           });
//       }
//     });
// });

//========================================
//Email Preview
//========================================


router.get("/preview",function(req,res) {
    
    async.waterfall([function(callback) {
          User.findOne({email: 'thantsintoewebdevelopment@gmail.com'},function(err,user) {
            if(err) console.log(err);
            callback(null,user);
          });
      },function(user) {
        
        Order.findOne({$and: [{user: user._id}, {status: 'CONFIRM'}]})
        .populate('user')
        .populate('line_items.item')
        .exec(function(err,order) {
            if(err) console.log(err);
            res.render('emails/orderDelivered',{user: user,order: order});
        });     
      }
    ]);

});



module.exports = router;
