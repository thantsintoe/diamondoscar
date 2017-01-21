//================================================
//Routes Related to User Sign,Login and Logout
//================================================
var express = require('express');
var router = express.Router();
var async = require('async');

var passport = require('passport');
var passportLocalMongoose = require('passport-local-mongoose');
var LocalStrategy = require('passport-local');

var User = require('../models/user');
var Order = require('../models/order');
var Category = require('../models/category');
var middleware = require('../middleware/middleware');

// router.get('/admin-control', middleware.isAdmin, function(req, res, next) {

//     async.waterfall([function(callback) {
//         Order.find({})
//             .populate('user')
//             .populate('line_items.item')
//             .exec(function(err, foundOrders) {
//                 if (err) return next(err);
//                 callback(null, foundOrders);
//             });
//     }, function(foundOrders, callback) {
//         User.find({})
//             .populate('history.item')
//             .populate('favourite')
//             .populate('Product')
//             .populate('order')
//             .exec(function(err, foundUsers) {
//                 if (err) return next(err);
//                 res.render('admin/admin', {
//                     users: foundUsers,
//                     orders: foundOrders
//                 });
//             });
//     }]);
// });


router.get('/admin-control',middleware.isAdmin, function(req, res, next) {

    async.waterfall([function(callback) {
        Order.find({})
            .sort({order_date: 'desc'})
            .populate('user')
            .populate('line_items.item')
            .populate({ 
                     path: 'line_items.item',
                     model: 'Product',
                     populate: {
                       path: 'category',
                       model: 'Category'
                     } 
                })
            .exec(function(err, foundOrders) {
                if (err) return next(err);
                console.log(foundOrders);
                callback(null, foundOrders);
            });
    }, function(foundOrders, callback) {
        User.find({})
            .populate('history.item')
            .populate('favourite')
            .populate('Product')
            .populate('order')
            .exec(function(err, foundUsers) {
                if (err) return next(err);
                res.render('admin/adminNew', {
                    users: foundUsers,
                    orders: foundOrders
                });
            });
    }]);



});
//=============================================
// Route for Viewing Overall Users as an ADMIN
//=============================================

router.get('/admin-control/useroverview',middleware.isAdmin, function(req, res, next) {

    async.waterfall([function(callback) {
        Order.find({})
            .populate('user')
            .populate('line_items.item')
            .exec(function(err, foundOrders) {
                if (err) return next(err);
                callback(null, foundOrders);
            });
    }, function(foundOrders, callback) {
        User.find({})
            .populate('history.item')
            .populate('favourite')
            .populate('Product')
            .populate('order')
            .exec(function(err, foundUsers) {
                if (err) return next(err);
                res.render('admin/useroverview', {
                    users: foundUsers,
                    orders: foundOrders
                });
            });
    }]);
});


router.get('/admin-control/:user_id/:order_id',middleware.isAdmin, function(req, res, next) {

    async.waterfall([function(callback) {
        Order.findOne({
                _id: req.params.order_id
            })
            .populate('user')
            .populate('line_items.item')
            .populate({ 
                     path: 'line_items.item',
                     model: 'Product',
                     populate: {
                       path: 'category',
                       model: 'Category'
                     } 
                })
            .exec(function(err, foundOrders) {
                if (err) return next(err);
                callback(null, foundOrders);
            });
    }, function(foundOrders, callback) {
        User.findOne({
                _id: req.params.user_id
            })
            .populate('history.item')
            .populate('favourite')
            .populate('Product')
            .populate('order')
            .exec(function(err, foundUsers) {
                if (err) return next(err);
                res.render('admin/orderView', {
                    user: foundUsers,
                    order: foundOrders
                });
            });
    }]);
});


module.exports = router;
