var express = require('express');
var router = express.Router();

var async = require('async');
var faker = require('faker');

var Category = require('../models/category');
var Product = require('../models/product');

router.get('/generate_products/:category_name',function(req,res,next) {
    async.waterfall([
            function(callback) {
                Category.findOne({name: req.params.category_name},function(err,foundCategory) {
                    if(err) {console.log(err);return next();}
                    callback(null,foundCategory);
                });
            },function(foundCategory,callback) {
                for (var i=0;i<30;i++) {
                    var product = new Product();
                    product.category = foundCategory._id;
                    product.name = faker.commerce.productName();
                    product.price = faker.commerce.price();
                    product.image = faker.image.image();
                    
                    product.save();
                }
            }
    ]);
        
    res.json({message: 'Successfully added products.'});
    
});

module.exports = router;