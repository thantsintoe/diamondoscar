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
var Category = require('../models/category');

router.get('/admin-control',function(req,res,next) {
    User.find({})
        .populate('history.item')
        .populate('favourite')
        .populate('Product')
        .exec(function(err, foundUsers) {
          if (err) return next(err);
          res.render('admin', { users: foundUsers });
    });
});





module.exports = router;