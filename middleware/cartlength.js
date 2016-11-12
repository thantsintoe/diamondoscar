var Order = require('../models/order');

module.exports = function(req,res,next) {
                    if (req.user) {
                        
                        var total = 0;
                        
                        Order.findOne({$and :[{user: req.user._id},{status: 'CART'}]},function(err,order) {
                            
                            if(order) 
                                {
                                    for(var i=0; i< order.line_items.length;i++) {
                                        total = total + order.line_items[i].quantity;
                                    }
                                    res.locals.cart = total;
                                } 
                            else 
                                {
                                    res.locals.cart = 0;
                                }
                            
                            if(err) {console.log(err);}
                            next();
                            
                        });
                        
                    } else next();
                };