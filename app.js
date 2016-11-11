var express             = require('express');
var app                 = express();
var mongoose            = require('mongoose');
var bodyParser          = require('body-parser');

var ejs                 = require('ejs');
var engine              = require('ejs-mate');

var passport            = require('passport');
var passportLocalMongoose = require('passport-local-mongoose');
var LocalStrategy       = require('passport-local');

var User = require('./models/user');
var Category = require('./models/category');
var Product = require('./models/product');

var indexRoutes = require('./routes/index');
var cartRoutes = require('./routes/cart');
var userRoutes = require('./routes/user');
var productRoutes = require('./routes/product');
var categoryRoutes = require('./routes/category');
var adminRoutes = require('./routes/admin');
// var generateProduct = require('./api/api');
var uploadRoutes = require('./routes/upload');


var cartLength = require('./middleware/cartlength');


// mongoose.connect('mongodb://localhost/ecommerce');
mongoose.connect('mongodb://thantsintoe:patoe1492010@ds053090.mlab.com:53090/thantsintoe-ecommerce');


app.engine('ejs',engine);
app.set('view engine','ejs');
app.use(express.static(__dirname + "/public"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(require('express-session')({
    secret: 'I have a dream',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// passport.use(new LocalStrategy(User.authenticate()));
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Middleware to pass the Current User info to every request
app.use(function(req,res,next) {
   res.locals.currentUser  = req.user;
   next();
});

//Middleware to pass the number of items in Cart
app.use(cartLength);


//Middleware to pass the Category info to every request
app.use(function(req,res,next) {

   Category.find({})
    .populate('parent_category')
    .populate('ancestors')
    .exec(function(err,categories) {
            if(err) {console.log(err); return next();}
             res.locals.categories  = categories;
             next();
    });
   
});

//Middleware to pass the Brand info to every request
app.use(function(req,res,next) {
    var brandArray = [];
   
   function contains(ar, obj) {
        for (var i = 0; i < ar.length; i++) {
            if (ar[i] === obj) {
                return true;
            }
        }
        return false;
    }
   
   Product.find({})
    .exec(function(err,products) {
            if(err) {console.log(err); return next();}
            products.forEach(function(product) {
                if(!contains(brandArray,product.detail.brand)) {
                     brandArray.push(product.detail.brand);
                }
            });  
             
    });
    
    res.locals.brandArray  = brandArray;
    next();
   
});

app.use(cartRoutes);
app.use(indexRoutes);
app.use(userRoutes);
app.use(categoryRoutes);
app.use(productRoutes);
app.use(uploadRoutes);
app.use(adminRoutes);


// app.use(generateProduct);


app.listen(process.env.PORT,process.env.IP,function() {
        console.log("Ecommerce Server is running...");
   
});