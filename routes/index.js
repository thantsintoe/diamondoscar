var express             = require('express');
var router              = express.Router();

var Order               = require('../models/order');

router.get('/',function(req,res) {
    res.render('home');
});



module.exports = router;