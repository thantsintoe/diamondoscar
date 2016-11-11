var mongoose = require('mongoose');

//Product Schema
var productSchema = new mongoose.Schema({
    name            : String,
    price           : Number,
    discountPrice  : Number,
    colors          : [{name: String, hex_code: String}],
    sizes           : [String],
    image           : [String],
    pictureName     : String,
    created         : {type: Date,default: Date.now},
    totalReview    : Number,
    rating          : Number,
    like            : Number,
    description     : String,
    detail          : {
                        serial_num   : {type: String,unique: true},
                        brand       : String
                        },
    category        : { 
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "Category"
                    },
    sub_category    : [{ 
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "Category"
                    }],
    tag             : []
    
});

productSchema.index({name: 'text'});

module.exports = mongoose.model('Product',productSchema);