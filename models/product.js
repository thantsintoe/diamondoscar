var mongoose = require('mongoose');
// var textSearch = require('mongoose-text-search');

//Product Schema
var productSchema = new mongoose.Schema({
    searchable: {type: String,unique: true},
    name            : {
                        en : String,
                        mm : String
                      },
    price           : Number,
    discountPrice  : Number,
    colors          : [{name: String, hex_code: String}],
    sizes           : [String],
    image           : [String],
    pictureName     : String,
    created         : {type: Date,default: Date.now},
    totalReview     : Number,
    rating          : Number,
    like            : Number,
    descriptionEN   : String,
    descriptionMM   : String,
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

productSchema.index({searchable: 'text'});

module.exports = mongoose.model('Product',productSchema);