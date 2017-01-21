var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

//User Schema
var userSchema = new mongoose.Schema({
    
    email       : {
                    type: String,
                    unique: true,
                    lowercase: true
                  },      
    password    : String,
    isAdmin     : {type: Boolean,default: false},
    username    : {type: String, default: ''},
    gender      : {type: String, default: 'Not Specified'},
    picture     : {type: String, default: '/images/users/default-user.png'},
    address     : {
                        room_no     : {type: String, default: ''},
                        floor       : {type: Number, default: '1'},
                        building_no : {type: String, default: ''},
                        street      : {type: String, default: ''},
                        ward        : {type: String, default: ''},
                        township    : {type: String, default: ''},
                        city        : {type: String, default: ''},
                        zip         : {type: Number, default: '111111'},
                        mobile      : {type: Number, default: '0'}
                   },
    order           : [{type: mongoose.Schema.Types.ObjectId, ref: 'Order'}],
    payment_methods : [{
                        name: String,
                        payment_token: String
                       }],
    history     : [{
                        date        : Date,
                        paid        : {type: Number, default: 0},
                        item        : {
                                        type: mongoose.Schema.Types.ObjectId,
                                        ref: 'Product'
                                      }
                  }],
    favourite     : [{
                                type: mongoose.Schema.Types.ObjectId,
                                ref : 'Product'
                    }],
});

userSchema.plugin(passportLocalMongoose,{usernameField:'email'});
userSchema.index({'$**': 'text'});

module.exports = mongoose.model('User',userSchema);