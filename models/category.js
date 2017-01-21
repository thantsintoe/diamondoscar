var mongoose = require('mongoose');

//Category Schema
var categorySchema = new mongoose.Schema({
    name: {type: String,unique: true},
    main_category: {type: Boolean, default: 'false'},
    parent_category : { 
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "Category"
                        },
    ancestors       : [{type: mongoose.Schema.Types.ObjectId,
                        ref: "Category"
                    }]
});

categorySchema.index({name: 'text'});

module.exports = mongoose.model('Category',categorySchema);