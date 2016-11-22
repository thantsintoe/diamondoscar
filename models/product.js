var mongoose = require('mongoose');

//Product Schema
var productSchema = new mongoose.Schema({
    name            : {
                        en : {type: String,unique: true},
                        mm : {type: String,unique: true}
                      },
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
    description     : {
                        en : {type: String},
                        mm : {type: String}
                      },
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
    comments        : [{
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "Comment"
                    }],
    tag             : []
    
});

productSchema.index({name: 'text'});

module.exports = mongoose.model('Product',productSchema);