var express             = require('express');
var router              = express.Router();
var methodOverride      = require('method-override');
var async               = require('async');

var Order               = require('../models/order');
var User               = require('../models/user');
var middleware          = require('../middleware/middleware');
var stripe      = require('stripe') ('sk_test_Pl3BaXGf0zSf8zyX6biMIAcn');

router.use(methodOverride("_method"));

router.post('/cart/product/:product_id',middleware.isLoggedIn,function(req,res) {
     
     async.waterfall([function(callback) {
        
        Order.findOne({$and :[{user: req.user._id},{status: 'CART'}]},function(err,order) {
            if(order) {
              console.log(order);
              callback(null);
            } else {
              var order = new Order();
                                  
              order.user      = req.user._id;
              order.status    = 'CART';
              
              order.save(function(err) {
                  if(err) {
                      console.log(err);
                      return res.redirect('/');
                  }
                  callback(null);
              });
            }
        });
        

     },function(callback) {
        Order.findOne({$and :[{user: req.user._id},{status: 'CART'}]},function(err,order) {
           if(err) console.log(err);
           order.line_items.push({
                   item    : req.body.product_id,
                   quantity: req.body.quantity,
                   size    : req.body.selected_size,
                   color   : parseInt(req.body.selected_color_no),
                   price   : parseFloat(req.body.priceHidden)
           });
  
           order.total_price = (order.total_price + parseFloat(req.body.priceHidden)).toFixed(2);
           order.status = 'CART';
           
           order.save(function(err) {
               if(err) {
                   console.log('Error while trying to save updated Cart');
                   console.log(err);
                   return res.redirect('/category/all/1');
               } else {
                   console.log(order);
                   return res.redirect('/cart');
               }
           });
        });
     }])
     
     
      
});


router.get('/cart',middleware.isLoggedIn,function(req,res,next) {
    Order.findOne({$and :[{user: req.user._id},{status: 'CART'}]})
         .populate('line_items.item')
         .exec(function(err,foundOrder) {
            if (err) {console.log(err); return next(err);}
            res.render('index/cart',{order: foundOrder});
    });
});


router.delete('/cart',middleware.isLoggedIn,function(req,res,next) {
    
        
        Order.findOne({$and :[{user: req.user._id},{status: 'CART'}]},function(err,foundOrder) {
            if(err) return next(err);
            foundOrder.line_items.pull(String(req.body.item));
            
            foundOrder.total_price = (foundOrder.total_price - parseFloat(req.body.price)).toFixed(2);
            foundOrder.save(function(err,found) {
                if(err) return next(err);
                res.redirect('/cart');
            });
        });

        // async.waterfall([function (callback) {
        //                 Order.findOne({user: req.user._id},function(err,foundOrder) {
        //                     if(err) console.log(err);
        //                     foundOrder.total_price = (foundOrder.total_price - parseFloat(req.body.price)).toFixed(2);
        //                     foundOrder.save();
        //                 });
        //                 callback(null);
        //         }, function(callback) {
        //             Order.findOneAndUpdate({user: req.user._id},{ $pull: { "line_items" : { _id: String(req.body.item) } }, },function(err,updatedOrder) {
        //                   if(err) {console.log(err); return next();}
        //                   res.redirect('/cart');
        //             });
        //         }]);
});


router.post('/payment',middleware.isLoggedIn,function(req,res,next) {
   
      var stripeToken = req.body.stripeToken;
      var currentCharges = Math.round(req.body.stripeMoney * 100);
      
      stripe.customers.create({
        source: stripeToken,
      }).then(function(customer) {
        return stripe.charges.create({
          amount: currentCharges,
          currency: 'sgd',
          customer: customer.id
        });
      }).then(function(charge) {
        async.waterfall([
          function(callback) {
            
            Order.findOne({$and :[{user: req.user._id},{status: 'CART'}]}, function(err, order) {
              if(err) {
                  console.log('Cannot find order for the user.');
                  console.log(err);
                  return next();
              }
              callback(err, order);
            });
          },
          function(order, callback) {
            User.findOne({ _id: req.user._id }, function(err, user) {
              if(err) {
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
          function(user) {
            // Order.update({ user: user._id }, { $set: { line_items: [], total_price: 0,status: 'PAID' }}, function(err, updated) {
            Order.update({ user: user._id }, { $set: {status: 'PAID' }}, function(err, updated) {
              if(err) {
                  console.log('Cannot find order');
                  console.log(err);
                  return next();
              }
              
              if (updated) {
                res.redirect('/profile');
              }
            });
          }
        ]);
      });
   
});

module.exports = router;