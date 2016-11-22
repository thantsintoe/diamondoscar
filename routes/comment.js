var express = require('express');
var router = express.Router();
var async = require('async');

//Required Middlewares
var methodOverride      = require('method-override');
var middleware          = require('../middleware/middleware');

//Data Models
var Category            = require('../models/category');
var Product             = require('../models/product');
var User                = require('../models/user');
var Comment             = require('../models/comment');

// default options 

router.use(methodOverride("_method"));



//NEW COMMENT ROUTE
//   router.get('/new',middleware.isLoggedIn,function(req,res) {
//       Product.findById(req.params.product_id,function(err,foundProduct) {
//          if(err)
//          {  console.log(err);}
//          else
//          {
//             res.render("comments/new",{product: foundProduct});
//          }
//       });
      
//   });

//POST COMMENT ROUTE
    router.post('/category/:category_name/product/:product_id/comments',middleware.isLoggedIn,function(req,res) {
      
      var newComment = req.body.comment;


        Product.findById(req.params.product_id,function(err,foundProduct) {
             if(err)
                {  
                    console.log(err);
                } else {
                    
                    
                    async.waterfall([function(callback) {
                        Comment.create(newComment, function(err, comment){
                              if(err)
                                  {
                                      console.log(err);
                                  } 
                              else 
                                  {
                                      //add username and id to comment
                                      comment.author.username = req.user.username;
                                      comment.author.id = req.user._id;
                                      
                                      //save comment
                                      comment.save();
                                      
                                      foundProduct.comments.push(comment);
                                      
                                      foundProduct.save(function(err,savedProduct) {
                                            if(err) {console.log(err);}
                                            callback(null,savedProduct);
                                       });
                                  }
                        });
                    },function(savedProduct,callback) {
                        
                        Product.findById(savedProduct._id)
                        .populate('comments')
                        .exec(function(err,product) {
                            if(!product) {console.log(err),console.log('cannot find product');res.redirect('back');}
                            var newRating = averageRating(product);
                            product.rating = newRating;
                            product.save();
                            
                            console.log("Created new comment");
                        //   req.flash('success','Successfully added a comment !');
                            res.redirect('back');
                      
                        });
                    }]);
                    
             }
        });
      
    });
   


//COMMENT UPDATE ROUTE
  router.put('/category/:category_name/product/:product_id/comments/:comment_id',function(req,res) {
      
      var updatedComment = req.body.comment;
      
      Comment.findByIdAndUpdate(req.params.comment_id,updatedComment,function(err,comment) {
         if(err)
         {
            console.log(err);
            res.redirect('back');
         }
         else {
            // req.flash('success','Successfully updated comment !');
            
            Product.findById(req.params.product_id)
            .populate('comments')
            .exec(function(err,product) {
                if(!product) {console.log(err),console.log('cannot find product');res.redirect('back');}
                var newRating = averageRating(product);
                product.rating = newRating;
                product.save();
                
                console.log("Comment Updated");
            //   req.flash('success','Successfully added a comment !');
                res.redirect('back');
          
            });
            
            
         }
      });
  });

//DESTROY ROUTER
  router.delete('/category/:category_name/product/:product_id/comments/:comment_id',function(req,res) {
      Comment.findByIdAndRemove(req.params.comment_id,function(err) {
         if(err)
         {
            console.log(err);
            res.redirect('back');
         } else {
            // req.flash('success','Successfully deleted comment');
            Product.findById(req.params.product_id)
            .populate('comments')
            .exec(function(err,product) {
                if(!product) {console.log(err),console.log('cannot find product');res.redirect('back');}
                var newRating = averageRating(product);
                product.rating = newRating;
                product.save();
                
                console.log("Comment Updated");
            //   req.flash('success','Successfully added a comment !');
                res.redirect('back');
          
            });
         }
      });
  });


//========================================
//CALCULATE AVERAGE RATING
//========================================

var averageRating = function(product) {

            var averageR = 0.0;
            if(product.comments.length>0) {
                                                
                product.comments.forEach(function(comment) {
                  averageR = parseFloat(averageR) + parseFloat(comment.rating);
                });
                
                return parseFloat(averageR/product.comments.length);
                  
            } else {
                return parseFloat(product.rating);
            }
            
        };




module.exports = router;