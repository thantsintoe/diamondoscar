//================================================
//Routes Related to User Sign,Login and Logout
//================================================
var express             = require('express');
var router              = express.Router();
var async               = require('async');

var passport            = require('passport');
var passportLocalMongoose = require('passport-local-mongoose');
var LocalStrategy       = require('passport-local');

var User = require('../models/user');
var Order = require('../models/order');
var middleware          = require('../middleware/middleware');


//Register GET route
    router.get('/register',function(req,res) {
       res.render('register');
    });

//Register POST route
    router.post('/register',function(req,res,next) {
        
        async.waterfall([function(callback) {
                                var newEmail = req.body.email;
                                var newUsername = req.body.username;
                                var newGender = 'Not Specified';
                                
                                if(req.body.gender_radio === '0') {
                                    newGender = 'Male';
                                } else {
                                    newGender = 'Female';
                                }
                                
                                
                                var newUser = new User({
                                    email: newEmail,
                                    username: newUsername,
                                    gender: newGender
                                });
                                
                                User.register(newUser,req.body.password,function(err,user) {
                                    if(err) {console.log(err);return res.redirect('/register');}
                                    passport.authenticate('local')(req,res,function() {
                                        console.log('User successfully registered');
                                        console.log(req.user);
                                        callback(null,user);
                                    });
                                });
            
                        }, function(user) {
                                var order = new Order();
                                
                                order.user      = user._id;
                                order.status    = 'CART';
                                
                                order.save(function(err) {
                                    if(err) {
                                        console.log(err);
                                        return res.redirect('/');
                                    }
                                    res.redirect('/category/all/1');
                                });
                                
                        }
            ]);
            
        
    });
    
    
//LOGIN GET route
    router.get('/login',function(req,res) {
       res.render('login');
    });
    
//LOGIN POST route
    router.post('/login',passport.authenticate('local',{
            successRedirect: "/category/all/1",
            failureRedirect: "/login"
        }),function(req,res) {
            
    });
    
//LOGOUT route
    router.get('/logout',function(req,res) {
       req.logout();
       res.redirect('/');
       console.log('User logged out');
    });
    
//Delete User
    router.delete('/delete-profile',function(req,res,next) {
        User.findByIdAndRemove(req.body.user_id,function(err) {
           if(err) console.log("User Cannot be Removed");
           console.log("User sucessfully removed");
           res.redirect('/admin-control');
        });
    });
    
    router.post('/allow-admin',function(req,res,next) {
        User.findByIdAndUpdate(req.body.user_id,{ $set: { isAdmin: true }},function(err,updatedUser) {
            if(err) {console.log(err); return next();}
            console.log(updatedUser);
            res.redirect('/admin-control');
        });
    });
            

//GET PROFILE

    router.get('/profile',middleware.isLoggedIn,function(req,res,next) {
        User.findOne({ _id: req.user._id })
        .populate('history.item')
        .populate('favourite')
        .populate('Product')
        .exec(function(err, foundUser) {
          if (err) return next(err);
          res.render('account/user_profile', { user: foundUser });
        });
    });

//EDIT PROFILE
    router.get('/edit-profile',middleware.isLoggedIn, function(req, res, next) {
      res.render('account/edit-profile');
    });

//POST EDIT PROFILE
    router.post('/edit-profile', function(req, res, next) {
      User.findOne({ _id: req.user._id }, function(err, user) {
    
        if (err) return next(err);
    
        if (req.body.name) user.username = req.body.name;
        
        if (req.body.room_no) user.address.room_no          = req.body.room_no;
        if (req.body.floor) user.address.floor              = req.body.floor;
        if (req.body.building_no) user.address.building_no  = req.body.building_no;
        if (req.body.street) user.address.street            = req.body.street;
        if (req.body.ward) user.address.ward                = req.body.ward;
        if (req.body.township) user.address.township        = req.body.township;
        if (req.body.city) user.address.city                = req.body.city;
        if (req.body.zip) user.address.zip                  = req.body.zip;
        
        if (req.body.mobile) user.address.mobile            = req.body.mobile;
    
        user.save(function(err) {
          if (err) {
              console.log("Error while trying to update user details!");
              console.log(err);
              return next(err);
          }
          return res.redirect('/profile');
        });
      });
    });
    
   


module.exports = router;