//MIDDLEWARE

var User = require('../models/user');
// var Comment = require('../models/comment');

var middlewareObj = {};


//checkCampgroundOwnership Middleware


// middlewareObj.checkCampgroundOwnership = function(req,res,next) 
//         {
//           if(req.isAuthenticated()) {
    
//               Campground.findById(req.params.id,function(err,foundCampground) {
//                   if(err)
//                       {
//                          req.flash('error',"Campground Not Found !");
//                          res.redirect('back');
//                       }
//                   else 
//                       {
//                          if(foundCampground.author.id.equals(req.user._id)) {
//                             next();
//                          } else {
//                             req.flash('error',"You don't have permission to do that !");
//                             res.redirect('/campgrounds/'+req.params.id);
//                          }
//                       }
                   
//                 }); 
//             } else {
//                 req.flash('error','You need to log in to do that !');
//                 res.redirect('/login');
//             }
                 
//         };
       
    //check Comment Ownership Middleware
    //   middlewareObj.checkCommentOwnership = function checkCommentOwnership(req,res,next) 
    //   {
    //       if(req.isAuthenticated()) {
    
    //           Comment.findById(req.params.comment_id,function(err,foundComment) {
    //               if(err)
    //                   {
    //                      res.redirect('back');
    //                   }
    //               else 
    //                   {
    //                      if(foundComment.author.id.equals(req.user._id)) {
    //                         next();
    //                      } else {
    //                         req.flash('error',"You don't have permission to do that !");
    //                         res.redirect('/campgrounds/'+req.params.id);
    //                      }
    //                   }
                   
    //          }); 
    //       } else {
             
    //          req.flash('error','You need to log in to do that !');
    //          res.redirect('/login');
    //       }
             
    //   };


//isLoggedIn Middleware
   middlewareObj.isLoggedIn = function isLoggedIn(req,res,next) 
   {
      if(req.isAuthenticated()) {
         return next();
      }
    //   req.flash('error','You need to log in to do that !');
      res.redirect('/login');
   };
   
//isLoggedIn Middleware
   middlewareObj.isAdmin = function isLoggedIn(req,res,next) 
   {
      if(req.isAuthenticated() && req.user.isAdmin) {
         return next();
      }
    //   req.flash('error','You need to log in to do that !');
      res.redirect('/login');
   };

//isLoggedOut Middleware
   middlewareObj.isLoggedOut = function isLoggedIn(req,res,next) 
   {
      if(req.isAuthenticated()) {
        // req.flash('error','You need to log out frist!');
        res.redirect('/');
      }
      
      return next();
   };
   
   
module.exports = middlewareObj;
