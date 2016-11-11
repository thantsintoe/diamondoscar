var express = require('express');
var router = express.Router();
var async = require('async');
var fileUpload = require('express-fileupload');
var fs = require('fs-extra');
var mkdirp = require('mkdirp');

var methodOverride = require('method-override');
var middleware          = require('../middleware/middleware');

var Category = require('../models/category');
var Product = require('../models/product');
var User = require('../models/user');

// default options 

router.use(methodOverride("_method"));

router.use(fileUpload({
    limits: {
        fileSize: 50 * 1024 * 1024
    },
}));




//========================================
//NEW route for Category (Form)
//========================================

router.get('/product/add', function(req, res) {
    res.render('product/new-product');
});


//========================================
//NEW route for Product (Post)
//========================================
router.post('/product/add', function(req, res, next) {

    var filename = [];
    var availableColors = [];
    var availableSizes = [];

    filename = upload(req, res, next).slice();



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
        function(callback) {Category.findOne({name: req.body.category}, function(err, foundCategory) {
                if (err) {
                    console.log(err);
                    return next();
                }
                callback(null, foundCategory);
            });
        },
        function(foundCategory, callback) {

            var product = new Product();

            product.category = foundCategory._id;
            product.name = req.body.name;
            product.detail.brand = req.body.brand;
            product.detail.serial_num = req.body.product_serial;
            product.price = req.body.price;
            product.discountPrice = req.body.discount_price;
            product.rating = req.body.rating;
            product.pictureName = filename[0];
            product.description = req.body.description;
            for (var b = 0; b < req.body.color_quantity; b++) {
                product.colors.push(availableColors[b]);
            }
            for (var c = 0; c < availableSizes.length; c++) {
                product.sizes.push(availableSizes[c]);
            }
            for (var a = 0; a < req.body.image_quantity; a++) {
                product.image.push('/images/products/' + req.body.name + '/' + filename[a]);
            }

            product.save();
            console.log('New Product has been added...');
            console.log(product);
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
        .exec(function(err, foundProduct) {
            if (err) {
                console.log(err);
                return res.redirect('/category/all/1');
            }
            res.render('product/show', {
                product: foundProduct
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
router.put('/category/:category_name/product/:product_id', function(req, res, next) {

    var filename = [];
    var availableColors = [];
    var availableSizes = [];
    var isUpdateImage = false;
    
    if(req.files.newImage1.name === '') {
      isUpdateImage = false;
    } else {
      isUpdateImage = true;
      
    }

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
    
    //Removing old folder in images of product needed to be updated
    if (isUpdateImage) {
        Product.findById(req.params.product_id, function(err, originalProduct) {
            if (err) {
                console.log('Cannot find product and folder to remove!');
                console.log(err);
                return res.redirect('/');
            }

            fs.removeSync('public/images/products/' + originalProduct.name, function(err) {
                if (err) {
                    console.log('folder cannot be removed');
                    console.log(err);
                    return next();
                }
                console.log('Folder successfully removed!');
                
            });
            
            filename = upload(req, res, next).slice();
        });
    }

    async.waterfall([
        function(callback) {
            Category.findOne({name: req.body.category}, function(err, foundCategory) {
                if (err) {
                    console.log(err);
                    return next();
                }
                callback(null, foundCategory);
            });
        },
        function(foundCategory, callback) {
            
            
                Product.findById(req.params.product_id,function(err,foundProduct) {
                
                    if(err) {console.log('cannot find product');console.log(err);}
                    
                    foundProduct.category        = foundCategory._id;
                    foundProduct.name            = req.body.name;
                    foundProduct.detail.brand    = req.body.brand;
                    foundProduct.detail.serial_num = req.body.product_serial;
                    foundProduct.price           = req.body.price;
                    foundProduct.discountPrice   = req.body.discount_price;
                    foundProduct.rating          = req.body.rating;
                    foundProduct.pictureName     = filename[0];
                    foundProduct.description     = req.body.description;
                    
                
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
                                    foundProduct.image.push('/images/products/' + req.body.name + '/' + filename[a]);
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
            console.log('Cannot find product and folder to remove!');
            console.log(err);
            return res.redirect('/');
        }
        fs.removeSync('public/images/products/' + originalProduct.name, function(err) {
            if (err) {
                console.error(err);
                return next();
            }
            console.log('Folder successfully removed!');
        });
    });

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
//PICTURE UPLOAD FUNCTION
//========================================

var upload = function(req, res, next) {

    var newFile = [];
    var fileName = [];

    for (var z = 1; z <= req.body.image_quantity; z++) {
        newFile.push(req['files']['newImage' + z]);
    }

    if (req.files.newImage1.name === '') {
        return null;
    } 
    else {
        //Create a Folder with the Name of the Product
        var newProductDir = './public/images/products/' + req.body.name;

        mkdirp(newProductDir, function(err) {
            if (err) {
                console.error(err);
                return res.redirect('/');
            }
            else console.log('Folder created as follow ' + newProductDir);
        });


        //Upload each image to Created Folder
        for (var i = 0; i < newFile.length; i++) {

            fileName[i] = newFile[i].name;

            newFile[i].mv('public/images/products/' + req.body.name + '/' + fileName[i], function(err) {
                if (err) {
                    console.log('Error while uploading...');
                    res.status(500).send(err);
                }
                else {
                    console.log('Image successfully uploaded.');
                }
            });


        }
        return fileName;

    }


};


module.exports = router;