var mongoose = require('mongoose');

//Order Schema
var orderSchema = new mongoose.Schema({
    
    user        : { 
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "User"
                    },
    total_price : {type: Number, default: 0},
    order_code  : String,
    grand_total : {type: Number, default: 0},
    delivery_fee: {type: Number, default: 0},
    status      : String,
    order_date  : { type: Date, default: Date.now },
    delivery_date: { type: Date, default: Date.now },
    delivery_option : {type: String, default: 'deliver'},
    payment_option  : {type: String, default: 'cash'},
    line_items  : [{
                        item        : {type: mongoose.Schema.Types.ObjectId, ref: 'Product'},
                        quantity    : {type: Number, default: 1},
                        size        : {type: String, default: 'M'},
                        color       : {type: Number, default: 0},
                        price       : {type: Number, default: 0}
                   }]
});



module.exports = mongoose.model('Order',orderSchema);