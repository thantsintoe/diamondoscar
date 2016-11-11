var mongoose = require('mongoose');

//Order Schema
var orderSchema = new mongoose.Schema({
    
    user        : { 
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "User"
                    },
    total_price : {type: Number, default: 0}, 
    status      : String,
    line_items  : [{
                        item        : {type: mongoose.Schema.Types.ObjectId, ref: 'Product'},
                        quantity    : {type: Number, default: 1},
                        size        : {type: String, default: 'M'},
                        color       : {type: Number, default: 0},
                        price       : {type: Number, default: 0}
                   }]
    
    
});



module.exports = mongoose.model('Order',orderSchema);