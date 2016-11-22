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
var commentRoutes = require('./routes/comment');
var categoryRoutes = require('./routes/category');
var adminRoutes = require('./routes/admin');

var uploadRoutes = require('./routes/upload');
var cloudinary = require('cloudinary');

var preferredLanguage = "en";

cloudinary.config({ 
  cloud_name: 'dzxsfe54s', 
  api_key: '343496594473383', 
  api_secret: '39yXvsQZMFG5q124Jslc8G8OkEA' 
});

var cartLength = require('./middleware/cartlength');


// mongoose.connect(process.env.DATABASEURL || 'mongodb://localhost/ecommerce');
mongoose.connect('mongodb://thantsintoe:patoe1492010@ds143767.mlab.com:43767/ecommerce-deployed');


app.engine('ejs',engine);
app.set('view engine','ejs');
app.use(express.static(__dirname + "/public"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(require('express-session')({
    secret: 'I have a dream',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 300000 }
}));

app.use(passport.initialize());
app.use(passport.session());

// passport.use(new LocalStrategy(User.authenticate()));
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Section and Cookie Parser
var cookieParser = require('cookie-parser');

app.use(cookieParser("I have a dream"));

//Language Localization for English and Myanmar
var i18n = require('i18n');

i18n.configure({
      //define how many languages we would support in our application
      locales:['en', 'mm'],
      
      //define the path to language json files, default is /locales
      directory: __dirname + '/locales',
      
      //define the default language
      defaultLocale: 'en',
      
      // define a custom cookie name to parse locale settings from 
      cookie: 'i18n'
});

app.use(i18n.init);



//Middleware to pass the Current User info to every request
app.use(function(req,res,next) {
   res.locals.currentUser  = req.user;
   next();
});

//Middleware to pass the Current Language every request
app.use(function(req,res,next) {
   res.locals.currentLanguage  = preferredLanguage;
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
app.use(commentRoutes);


app.get('/mm',function(req,res) {
    preferredLanguage = 'mm';
    res.cookie('i18n', 'mm');
    res.redirect('back');
});

app.get('/en',function(req,res) {
    preferredLanguage = 'en';
    res.cookie('i18n', 'en');
    res.redirect('back');
});


app.listen(process.env.PORT,process.env.IP,function() {
        console.log("Ecommerce Server is running...");
   
});