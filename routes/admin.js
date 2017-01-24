//================================================
//Routes Related to User Sign,Login and Logout
//================================================
var express = require('express');
var router = express.Router();
var async = require('async');
var nodemailer          = require("nodemailer");
var ejs                 = require('ejs');

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

// =============================
// Order Delivered
// =============================
router.put('/deliver/:order_id',function(req,res,next) {
    
    var smtpTransport = nodemailer.createTransport("SMTP",{
                            host: 'smtp.gmail.com',
                            secureConnection: false,
                            port: 587,
                            auth: {
                                user: 'mr.thantsintoe@gmail.com', //Sender Email id
                                pass: 'Patoe149201031' //Sender Email Password
                            }
                        });
    
    async.waterfall([function(callback) {
        Order.findOne({_id: req.params.order_id})
        .populate('user')
        .populate('line_items.item')
        .exec(function(err, foundOrder) {
            if(err) {
              console.log("Cannot find Order to upate the status");
              console.log(err);
            }
            foundOrder.status = "DELIVERED";
            foundOrder.markModified('status');
            foundOrder.save(function(err,updatedOrder) {
                if(err) {
                    console.log('Error while trying to update the Order Status!');
                    console.log(err);
                }
                // console.log(updatedOrder._id);
                // console.log(updatedOrder.line_items[0].item.name.en);
                // console.log(updatedOrder.status);
                callback(null,updatedOrder);
                // res.redirect('/admin-control');
            });
        });    
    },function(updatedOrder,callback) { //Render HTML file before sending
        ejs.renderFile('views/emails/orderDelivered.ejs',{user: updatedOrder.user,order: updatedOrder},function(err,html) {
            if(err) console.log(err);
            callback(null,updatedOrder,html);
        });
    },function(updatedOrder,html) { // Send the rendered html to customer
        
        var mailOptions = {
            from: 'mr.thantsintoe@gmail.com',
            to: updatedOrder.user.email, 
            subject: 'Ordered Item successfully delivered !', 
            html: html
        };

        smtpTransport.sendMail(mailOptions, function(error, response){
            if(error){
                console.log(error);
                res.end("error");
            } else {
                console.log("Email sent");
                res.redirect('/admin-control');
            }
        });
    }]);
});

// =============================
// Order Shipped
// =============================
router.put('/ship/:order_id',function(req,res,next) {
    
    var smtpTransport = nodemailer.createTransport("SMTP",{
                            host: 'smtp.gmail.com',
                            secureConnection: false,
                            port: 587,
                            auth: {
                                user: 'mr.thantsintoe@gmail.com', //Sender Email id
                                pass: 'Patoe149201031' //Sender Email Password
                            }
                        });
    
    async.waterfall([function(callback) {
        Order.findOne({_id: req.params.order_id})
        .populate('user')
        .populate('line_items.item')
        .exec(function(err, foundOrder) {
            if(err) {
              console.log("Cannot find Order to upate the status");
              console.log(err);
            }
            foundOrder.status = "SHIPPED";
            foundOrder.markModified('status');
            foundOrder.save(function(err,updatedOrder) {
                if(err) {
                    console.log('Error while trying to update the Order Status!');
                    console.log(err);
                }
                // console.log(updatedOrder._id);
                // console.log(updatedOrder.line_items[0].item.name.en);
                // console.log(updatedOrder.status);
                callback(null,updatedOrder);
                // res.redirect('/admin-control');
            });
        });    
    },function(updatedOrder,callback) { //Render HTML file before sending
        ejs.renderFile('views/emails/orderShipped.ejs',{user: updatedOrder.user,order: updatedOrder},function(err,html) {
            if(err) console.log(err);
            callback(null,updatedOrder,html);
        });
    },function(updatedOrder,html) { // Send the rendered html to customer
        
        var mailOptions = {
            from: 'mr.thantsintoe@gmail.com',
            to: updatedOrder.user.email, 
            subject: 'Ordered Item shipped !', 
            html: html
        };

        smtpTransport.sendMail(mailOptions, function(error, response){
            if(error){
                console.log(error);
                res.end("error");
            } else {
                console.log("Email sent");
                res.redirect('/admin-control');
            }
        });
    }]);
});


module.exports = router;
