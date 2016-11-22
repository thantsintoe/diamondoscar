var express = require('express');
var router = express.Router();

var passport = require('passport');
var passportLocalMongoose = require('passport-local-mongoose');
var LocalStrategy = require('passport-local');
var async = require('async');

var mongoose = require('mongoose');

var User = require('../models/user');
var Category = require('../models/category');
var Product = require('../models/product');


//========================================
//NEW route for Category (Form)
//========================================

router.get('/category/add', function(req, res) {
    Category.find({}, function(err, categories) {
        if (err) {
            console.log(err);
            console.log('cannot find all category');
        }
        res.render('category/new-category', {
            categories: categories
        });
    });

});


//========================================
//NEW route for Category (Post)
//========================================
router.post('/category', function(req, res, next) {

    if (req.body.parent_name) {
        async.waterfall([
            function(callback) {
                Category.findOne({
                    name: req.body.parent_name
                }, function(err, parentCategory) {
                    if (err) {
                        console.log(err);
                        return next();
                    }
                    var category = new Category();

                    category.parent_category = parentCategory._id;
                    category.name = req.body.name;
                    category.save();
                    console.log('New category is ');
                    console.log(category);
                    callback(null, category);
                });
            },
            function(category, callback) {
                // var id = category.parent_category;

                Category.findOne({
                    name: req.body.parent_name
                }, function(err, foundCategory) {
                    if (err) {
                        console.log(err);
                        console.log('cannot find parent category by id');
                        return next();
                    }
                    foundCategory.ancestors.push(category._id);
                    foundCategory.save();
                    console.log('parent category is ');
                    console.log(foundCategory);
                });
            }
        ]);
    }
    else {

        Category.create({
            name: req.body.name,
            main_category: true
        }, function(err, createdCategory) {
            if (err) {
                console.log(err);
                console.log('Error while creating new category');
                return next();
            }
            console.log('New Category successfully created as follow: ');
            console.log(createdCategory);
        });
    }


    res.redirect('/admin-control');

});


//========================================
//INDEX route for All Categories
//========================================



router.get('/category/all/:page_no', function(req, res, next) {

    var perPage = 12;
    var pageNo = req.params.page_no;
    var totalPages = 1;

    Product.find({})
        .skip(perPage * (pageNo - 1))
        .limit(perPage)
        .populate('category')
        .exec(function(err, foundProducts) {
            if (err) {
                console.log(err);
                return res.render('/');
            }
            Product.count().exec(function(err, count) {
                if (err) {
                    return next(err);
                }
                if (parseInt(count) % parseInt(perPage) === 0) {
                    totalPages = parseInt(parseInt(count) / parseInt(perPage));
                }
                else {
                    totalPages = (Math.floor(parseInt(count) / parseInt(perPage))) + 1;
                }


                res.render('product/index', {
                    products: foundProducts,
                    category: 'all',
                    parent_category: null,
                    totalPages: totalPages,
                    currentPage: pageNo
                });
            });

        });
});


//========================================
//INDEX route for Specific Category
//========================================
router.get('/category/:category_name/:page_no', function(req, res, next) {
    var perPage = 12;
    var pageNo = req.params.page_no;
    var totalPages = 1;
    var parentCategory = '';

    async.waterfall([
        function(callback) {
            Category.findOne({name: req.params.category_name})
            .populate('parent_category')
            .exec(function(err, foundCategory) {
                if (err) {
                    console.log(err);
                    return res.send('Cannot find ' + req.params.category_name + ' in the database');
                }
                parentCategory = foundCategory.parent_category.name;
                callback(null, foundCategory);
            });
            
        },
        function(foundCategory, callback) {

            // if (foundCategory.main_category) {

            //         async.waterfall([
            //             function(callback) {
            //                 var allProduct = [];
            //                 for (var i=0 ;i<foundCategory.ancestors.length;i++) {

            //                     Product.find({category: foundCategory.ancestors[i]})
            //                     .skip(perPage*(pageNo-1))
            //                     .limit(perPage)
            //                     .populate('category')
            //                     .exec(function(err,foundProducts) {
            //                         if(err) {console.log(err);return res.render('/');}
            //                         //  allProduct.concat(foundProducts);
            //                          Array.prototype.push.apply(allProduct, foundProducts);
            //                          callback(null,allProduct);
            //                     });

            //                     // console.log(allProduct);
            //                 }


            //             },function(allProduct,callback) {
            //                 // console.log(allProduct);                    
            //                 res.render('product/index',{
            //                      products: allProduct, 
            //                      category: req.params.category_name, 
            //                      totalPages: (allProduct.length/perPage)+1,
            //                      currentPage: pageNo
            //                 });
            //             }]);

            // } else {
            
            
            var found_id = foundCategory._id;


            Product.find({
                    $or: [{
                        category: found_id
                    }, {
                        category: foundCategory.ancestors[0]
                    }]
                })
                .skip(perPage * (pageNo - 1))
                .limit(perPage)
                .populate('category')
                .exec(function(err, foundProducts) {
                    if (err) {
                        console.log(err);
                        return res.render('/');
                    }

                    Product.count({
                        category: found_id
                    }).exec(function(err, count) {
                        if (err) {
                            return next(err);
                        }
                        if (parseInt(count) % parseInt(perPage) === 0) {
                            totalPages = parseInt(parseInt(count) / parseInt(perPage));
                        }
                        else {
                            totalPages = (Math.floor(parseInt(count) / parseInt(perPage))) + 1;
                        }
                        res.render('product/index', {
                            products: foundProducts,
                            category: req.params.category_name,
                            parent_category: parentCategory,
                            totalPages: totalPages,
                            currentPage: pageNo
                        });
                    });

                });
        }

    ]);

});

module.exports = router;