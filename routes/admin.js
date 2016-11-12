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
var middleware          = require('../middleware/middleware');

router.get('/admin-control',middleware.isAdmin,function(req,res,next) {
    
    async.waterfall([function(callback) {
        Order.find({})
            .populate('user')
            .populate('line_items.item')
            .exec(function(err, foundOrders) {
              if (err) return next(err);
              callback(null,foundOrders);
        });    
    },function(foundOrders,callback) {
        User.find({})
            .populate('history.item')
            .populate('favourite')
            .populate('Product')
            .populate('order')
            .exec(function(err, foundUsers) {
              if (err) return next(err);
              res.render('admin', { users: foundUsers,orders: foundOrders});
        });
    }]);
    
    
    
});

module.exports = router;