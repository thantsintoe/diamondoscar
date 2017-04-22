var express             = require('express');
var router              = express.Router();

var Order               = require('../models/order');

router.get("/*",function(req,res) {
    res.send("This is a 404 Page !");
});


module.exports = router;