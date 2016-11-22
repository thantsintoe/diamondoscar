var express = require('express');
var router = express.Router();
var async = require('async');

var methodOverride      = require('method-override');
var middleware          = require('../middleware/middleware');
var cloudinary          = require('cloudinary');

var multipart           = require('connect-multiparty');
var multipartMiddleware = multipart();

var Category            = require('../models/category');
var Product             = require('../models/product');
var User                = require('../models/user');

// default options 

router.use(methodOverride("_method"));


cloudinary.config({ 
  cloud_name: 'dzxsfe54s', 
  api_key: '343496594473383', 
  api_secret: '39yXvsQZMFG5q124Jslc8G8OkEA' 
});



//========================================
//NEW route for Category (Form)
//========================================

router.get('/product/add', function(req, res) {
    res.render('product/new-product');
});


//========================================
//NEW route for Product (Post)
//========================================
router.post('/product/add',multipartMiddleware, function(req, res, next) {
    
    var filename = [];
    var availableColors = [];
    var availableSizes = [];
    var newFile = [];

  
    for (var z = 1; z <= req.body.image_quantity; z++) {
        newFile.push(req['files']['newImage' + z]['path']);
    }

    // filename = upload(req, res, next).slice();

    for (var z = 1; z <= req.body.color_quantity; z++) {
        availableColors.push({
            name: req['body']['color_name' + z],
            hex_code: req['body']['color' + z]
        });
    }

    if (req.body.size_xs) {
        availableSizes.push('XS');
    }

    if (req.body.size_s) {
        availableSizes.push('S');
    }
    if (req.body.size_m) {
        availableSizes.push('M');
    }
    if (req.body.size_l) {
        availableSizes.push('L');
    }
    if (req.body.size_xl) {
        availableSizes.push('XL');
    }


    async.waterfall([
        function(callback) {
            console.log(req.body.category);
            Category.findOne({name: req.body.category}, function(err, foundCategory) {
                if (err) {
                    console.log('Category does not exist');
                    console.log(err);
                    return res.send('Category does not exist');
                }
                callback(null, foundCategory);
            });
        },
        function(foundCategory, callback) {

            var product = new Product();

            product.category = foundCategory._id;
            product.name.en = req.body.name_en;
            product.name.mm = req.body.name_mm;
            product.detail.brand = req.body.brand;
            product.detail.serial_num = req.body.product_serial;
            product.price = req.body.price;
            product.discountPrice = req.body.discount_price;
            product.rating = req.body.rating;
            product.pictureName = filename[0];
            product.description.en = req.body.description_em;
            product.description.mm = req.body.description_mm;
            for (var b = 0; b < req.body.color_quantity; b++) {
                product.colors.push(availableColors[b]);
            }
            for (var c = 0; c < availableSizes.length; c++) {
                product.sizes.push(availableSizes[c]);
            }
            for (var a = 0; a < req.body.image_quantity; a++) {
                
                cloudinary.uploader.upload(newFile[a],function(result) { 
                   console.log(result);
                   product.image.push(result.url);
                   product.save();
                },{public_id: req.body.name_en + a,folder :"Ecommerce/"});
            }
            
           
            product.save();
            console.log('Successfully created a new product');
           
        }
    ]);

    res.redirect('/admin-control');

});

//========================================
//SHOW route for Product
//========================================
router.get('/category/:category_name/product/:product_id', function(req, res) {
    

    Product.findById(req.params.product_id)
        .populate('category')
        .populate('comments')
        .exec(function(err, foundProduct) {
            if (err) {
                console.log(err);
                return res.redirect('/category/all/1');
            }
            
            // Using Callback function to get return from a Mongoose Query
            findParentCategoryName(req.params.category_name, function (name) {
                res.render('product/show', {
                    product: foundProduct,
                    category: req.params.category_name,
                    parent_category: name
                });
            });
            
            
        });
});

//========================================
//EDIT route for Product
//========================================
router.get('/category/:category_name/product/:product_id/edit', function(req, res) {

    Product.findById(req.params.product_id)
        .populate('category')
        .exec(function(err, foundProduct) {
            if (err) {
                console.log(err);
                return res.render('/');
            }
            res.render('product/edit', {
                product: foundProduct,
                category: req.params.category_name,
            });
        });
});

//========================================
//UPDATE route for Product
//========================================
router.put('/category/:category_name/product/:product_id',multipartMiddleware, function(req, res, next) {

    var filename = [];
    var availableColors = [];
    var availableSizes = [];
    var isUpdateImage = false;
    
    var newFile = [];


    if(req.files.newImage1.name === '') {
      isUpdateImage = false;
    } else {
        isUpdateImage = true;
        
        for (var z = 1; z <= req.body.image_quantity; z++) {
            newFile.push(req['files']['newImage' + z]['path']);
        }
            
        Product.findById(req.params.product_id,function(err,foundProduct) {
            if(err) {console.log('cannot find product');console.log(err); return res.redirect('/category/all/1');}
            for (var j=0; j<foundProduct.image.length; j++) {
                cloudinary.uploader.destroy('Ecommerce/'+ foundProduct.name+j, function(err,result) {
                    if(err) {console.log('cannot delete product image');console.log(err);}
                },{invalidate: true});
            }
            
        });
    }
    //Saving color data into Product Data
    for (var z = 1; z <= req.body.color_quantity; z++) {
        availableColors.push({
            name: req['body']['color_name' + z],
            hex_code: req['body']['color' + z]
        });
    }
    
    //Saving size data into Product Data
    if (req.body.size_xs) {
        availableSizes.push('XS');
    }

    if (req.body.size_s) {
        availableSizes.push('S');
    }
    if (req.body.size_m) {
        availableSizes.push('M');
    }
    if (req.body.size_l) {
        availableSizes.push('L');
    }
    if (req.body.size_xl) {
        availableSizes.push('XL');
    }
    
   
    //Find the category, update the product into database and upload the new images to cloudinary
    async.waterfall([
        function(callback) {
            console.log(req.body);
            Category.findOne({name: req.body.category}, function(err, foundCategory) {
                if (err) {
                    console.log(err);
                    return next();
                }
                if(!foundCategory) {console.log('cannot find category'); return res.redirect('/category/all/1');}
                callback(null, foundCategory);
            });
        },
        function(foundCategory, callback) {
            
            
                Product.findById(req.params.product_id,function(err,foundProduct) {
                
                    if(err) {console.log('cannot find product');console.log(err); return res.redirect('/category/all/1');}
                    if(!foundProduct) {console.log('cannot find product');console.log(err); return res.redirect('/category/all/1');}
                    
                    foundProduct.category        = foundCategory._id;
                    foundProduct.name.en            = req.body.name_en;
                    foundProduct.name.mm            = req.body.name_mm;
                    foundProduct.detail.brand    = req.body.brand;
                    foundProduct.detail.serial_num = req.body.product_serial;
                    foundProduct.price           = req.body.price;
                    foundProduct.discountPrice   = req.body.discount_price;
                    foundProduct.rating          = req.body.rating;
                    foundProduct.pictureName     = filename[0];
                    foundProduct.description.en     = req.body.description_en;
                    foundProduct.description.mm     = req.body.description_mm;
                    
                
                    async.waterfall([function(callback) {
                            foundProduct.colors.length = 0;
                            foundProduct.sizes.length = 0;
                            
                            if (isUpdateImage) {
                                foundProduct.image.length = 0;
                            }
                            
                            foundProduct.markModified('sizes');
                            foundProduct.markModified('colors');
                            foundProduct.markModified('image');
                            foundProduct.save(function(err,updated) {
                                if(err) console.log(err);
                                callback(null,updated);
                            });
                            
                        },function(foundProduct,callback) {
                            for (var b = 0; b < req.body.color_quantity; b++) {
                                foundProduct.colors.push(availableColors[b]);
                            }
                            for (var c = 0; c < availableSizes.length; c++) {
                                foundProduct.sizes.push(availableSizes[c]);
                            }
                            
                            foundProduct.markModified('sizes');
                            foundProduct.markModified('colors');
                            foundProduct.save(function(err,updated) {
                                if(err) console.log(err);
                                callback(null,updated);
                            });
                            
                        },function(foundProduct,callback) {
                            if (isUpdateImage) {
                                
                                for (var a = 0; a < req.body.image_quantity; a++) {
    
                                    cloudinary.uploader.upload(newFile[a],function(result) { 
                                       console.log(result.url);
                                       foundProduct.image.push(result.url);
                                       foundProduct.markModified('image');
                                       foundProduct.save();
                                    },{public_id: req.body.name_en + a,folder :"Ecommerce/",invalidate: true});
                                }

                            }
                            
                            foundProduct.markModified('sizes');
                            foundProduct.markModified('colors');
                            foundProduct.markModified('image');
                            foundProduct.save(function(err,updated) {
                             if(err) console.log(err);
                             console.log(updated);
                             res.redirect('/category/all/1');
                            });
                        }
                    ]);
                });
        }
    ]);

});


//========================================
//DELETE route for Product
//========================================
router.delete('/category/:category_name/product/:product_id', function(req, res, next) {

    Product.findById(req.params.product_id, function(err, originalProduct) {
        if (err) {
            console.log('Cannot find product to remove!');
            console.log(err);
        }
        
        //Remove Image from Cloudinary
        for (var j=0; j<originalProduct.image.length; j++) {
            cloudinary.uploader.destroy('Ecommerce/'+ originalProduct.name+j, function(err,result) {
                if(err) {console.log('cannot delete product image');console.log(err);}
            },{invalidate: true});
        }

    });
    
    //Remove Product from Database
    Product.findByIdAndRemove(req.params.product_id, function(err) {
        if (err) {
            console.log('Error while trying to delete the product');
            console.log(err);
            return res.redirect('/category/all/1');
        }
        console.log('A product has been successfully deleted');
        res.redirect('/category/all/1');
    });

});


//========================================
//SEARCH route
//========================================


router.post('/search', function(req, res) {
    res.redirect('/search?q=' + req.body.q);
});

router.get('/search', function(req, res) {
    if (req.query.q) {
        Product.find({
                $text: {
                    $search: req.query.q
                }
            }, {
                score: {
                    $meta: "textScore"
                }
            })
            .sort({
                score: {
                    $meta: 'textScore'
                }
            })
            .limit(10)
            .populate('category')
            .exec(function(err, foundProducts) {
                if (err) {
                    console.log(err);
                    return res.redirect('/');
                }
                res.render('product/search-results', {
                    query: req.query.q,
                    products: foundProducts
                });
            });
    }
});

//========================================
//Wish List route
//========================================

 
    router.post('/category/:category_name/product/:product_id/add-wishlist',middleware.isLoggedIn,function(req,res,next) {
            
            async.waterfall([
                  function(callback) {
                    
                    Product.findOne({ _id: req.params.product_id }, function(err, product) {
                      if(err) {
                          console.log('Cannot find product for to add to WishList.');
                          console.log(err);
                          return next();
                      }
                      callback(err, product);
                    });
                  },
                  function(product, callback) {
                    User.findOne({ _id: req.user._id }, function(err, user) {
                      if(err) {
                          console.log('Cannot find user');
                          console.log(err);
                          return next();
                      }
                      
                      if (user) {
                        
                        user.favourite.push(product);
                       
                        user.save(function(err, user) {
                          if (err) return next(err);
                          console.log(user.favourite);
                          res.redirect('/profile');
                        });
                      }
                    });
                  }
            ]);
    });


//========================================
//Find Parent Category Name FUNCTION
//========================================

var findParentCategoryName = function(childName,callback) { //Using callback to return value from the inside of async. mongoose query
    
    Category.findOne({name: childName})
    .populate('parent_category')
    .exec(function(err,foundCategory) {
       if(err) {console.log(err);}
       var parentName = foundCategory.parent_category.name;
       callback(parentName);
    });
    
    
};

module.exports = router;