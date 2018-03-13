let express                 = require('express');
let router                  = express.Router();
let passport                = require('passport');
let passportLocalMongoose   = require('passport-local-mongoose');
let LocalStrategy           = require('passport-local');
let async                   = require('async');
let mongoose                = require('mongoose');
let User                    = require('../models/user');
let Category                = require('../models/category');
let Product                 = require('../models/product');

//========================================
//Home Page
//========================================
router.get('/',function(req,res) {
    
    async.waterfall([function(callback) {
        Product.find({})
            .sort({rating: -1})
            .limit(12)
            .populate('category')
            .populate('comments')
            .exec(function(err, hotProducts) {
                if (err) {
                    console.log(err);
                    
                }
                callback(null,hotProducts)
        });
    }
    ,function(hotProducts,callback) {
        Product.find({})
            .sort({created: -1})
            .limit(12)
            .populate('category')
            .populate('comments')
            .exec(function(err, foundProducts) {
                if (err) {
                    console.log(err);
                    
                }
                res.render('home', {
                    similarItems: foundProducts,
                    hotItems: hotProducts
                });
        });
    }]);

});


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
                        let category = new Category();
    
                        category.parent_category = parentCategory._id;
                        category.name = req.body.name;
                        category.save();
                        console.log('New category is ');
                        console.log(category);
                        callback(null, category);
                    });
                },
                function(category, callback) {
                    // let id = category.parent_category;
    
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
                        // console.log('parent category is ');
                        // console.log(foundCategory);
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
        req.flash('success','Successfully created a new category !');
        res.redirect('/admin-control');
    });

//========================================
//INDEX route for All Categories
//========================================

    router.get('/category/all/:page_no/*', function(req, res, next) {
    
        let name    = req.query.sort;
        let dir     = req.query.dir;
        
        let Sort = {};
        Sort[name] = dir;
        
        let perPage = 12;
        let pageNo = req.params.page_no;
        let totalPages = 1;
        let requestedURL = '/category/all/';
    
        Product.find({})
            .sort(Sort)
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
                        currentPage: pageNo,
                        URL: requestedURL,
                        sortCriteria: req.query.sort,
                        sortDir: req.query.dir
                    });
                });
    
            });
    });


//========================================
//INDEX route for Specific Sub-Category
//========================================

    router.get('/category/:category_name/:page_no/', function(req, res, next) {
        
        let name    = req.query.sort;
        let dir     = req.query.dir;
        
        let Sort = {};
        Sort[name] = dir;
        
        let perPage = 12;
        let pageNo = req.params.page_no;
        let totalPages = 1;
        let parentCategory = '';
        let requestedURL = '/category/'+ req.params.category_name + '/';
    
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
    
                let found_id = foundCategory._id;
    
    
                Product.find({
                        $or: [{
                            category: found_id
                        }, {
                            category: foundCategory.ancestors[0]
                        }]
                    })
                    .sort(Sort)
                    .skip(perPage * (pageNo - 1))
                    .limit(perPage)
                    .populate('category')
                    .sort({'created.date':1})
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
                            // console.log(req.query.sort);
                            res.render('product/index', {
                                products: foundProducts,
                                category: req.params.category_name,
                                parent_category: parentCategory,
                                totalPages: totalPages,
                                currentPage: pageNo,
                                URL: requestedURL,
                                sortCriteria: req.query.sort,
                                sortDir: req.query.dir
                            });
                        });
    
                    });
            }
        ]);
    
    });
    
//========================================
//INDEX route for Specific Main-Category
//========================================   
    
    router.get('/main-category/:category_name/:page_no/', function(req, res, next) {
        
        let name    = req.query.sort;
        let dir     = req.query.dir;
        
        let Sort = {};
        Sort[name] = dir;
        
        let perPage = 12;
        let pageNo = req.params.page_no;
        let totalPages = 1;
        let parentCategory = '';
        let requestedURL = '/main-category/'+ req.params.category_name + '/';
            
            async.waterfall([
                function(callback) {
                    Category.findOne({name: req.params.category_name})
                    .populate('ancestors')
                    .exec(function(err, foundCategory) {
                        if (err) {
                            console.log(err);
                            return res.send('Cannot find ' + req.params.category_name + ' in the database');
                        }
                        // parentCategory = foundCategory.parent_category.name;
                        callback(null, foundCategory);
                    });
                },
                function(foundCategory, callback) {

                    let found_id = foundCategory._id;

                    Product.find()
                        .sort(Sort)
                        .skip(perPage * (pageNo - 1))
                        .limit(perPage)
                        .populate('category')
                        .exec(function(err, foundProducts) {
                            
                            foundProducts = foundProducts.filter(function(product) {
                                return product.category.parent_category.equals(foundCategory._id);
                                
                            });

                            if (err) {
                                console.log(err);
                                return res.render('/');
                            }
                            
                                let count = foundProducts.length;
                                
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
                                    currentPage: pageNo,
                                    URL: requestedURL,
                                    sortCriteria: req.query.sort,
                                    sortDir: req.query.dir
                                });
                        });
                    }
                ]);
    });


//========================================
//INDEX route for Specific Brand
//========================================

    router.get('/brand/:brand_name/:page_no/', function(req, res, next) {
        
        let name    = req.query.sort;
        let dir     = req.query.dir;
        
        let Sort = {};
        Sort[name] = dir;
        
        let perPage = 12;
        let pageNo = req.params.page_no;
        let totalPages = 1;
        let parentCategory = '';
        let requestedURL = '/brand/'+ req.params.brand_name + '/';
    
        async.waterfall([
            function(callback) {
    
                Product.find({'detail.brand': req.params.brand_name})
                    .sort(Sort)
                    .skip(perPage * (pageNo - 1))
                    .limit(perPage)
                    .populate('category')
                    .exec(function(err, foundProducts) {
                        if (err) {
                            console.log(err);
                            return res.render('/');
                        }
    
                        Product.count({'detail.brand': req.params.brand_name})
                            .exec(function(err, count) {
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
                                category: null,
                                parent_category: parentCategory,
                                totalPages: totalPages,
                                currentPage: pageNo,
                                brand: req.params.brand_name,
                                URL: requestedURL,
                                sortCriteria: req.query.sort,
                                sortDir: req.query.dir
                            });
                        });
    
                });
            }
        ]);
    
    });

module.exports = router;