let express             = require('express');
let app                 = express();
let mongoose            = require('mongoose');
let bodyParser          = require('body-parser');
let nodemailer          = require("nodemailer");
let async                   = require('async');

let ejs                 = require('ejs');
let engine              = require('ejs-mate');
let flash               = require('connect-flash');

let passport            = require('passport');
let passportLocalMongoose = require('passport-local-mongoose');
let LocalStrategy       = require('passport-local');
let compressor          = require('node-minify');
let minifyNow           = require('./api/minifyNow');

let User = require('./models/user');
let Category = require('./models/category');
let Product = require('./models/product');


let cartRoutes = require('./routes/cart');
let userRoutes = require('./routes/user');
let productRoutes = require('./routes/product');
let commentRoutes = require('./routes/comment');
let categoryRoutes = require('./routes/category');
let adminRoutes = require('./routes/admin');
let indexRoutes = require('./routes/index');
let cloudinary = require('cloudinary');

let cartLength = require('./middleware/cartlength');
let preferredLanguage = "en";

const mongoURL = process.env.MONGO_URL;
mongoose.connect(mongoURL);

let cloudinaryConfig = require('../config/cloudinary')
cloudinary.config(cloudinaryConfig);

app.engine('ejs',engine);
app.set('view engine','ejs');
app.use(express.static(__dirname + "/public"));

app.use(flash());

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

passport.authenticate('local', { failureFlash: 'Incorrect username or password.' });

//Section and Cookie Parser
let cookieParser = require('cookie-parser');

app.use(cookieParser("I have a dream"));

// minifyNow();

//Language Localization for English and Myanmar
let i18n = require('i18n');

i18n.configure({
      //define how many languages we would support in our application
      locales:['en', 'mm'],
      
      //define the path to language json files
      directory: __dirname + '/locales',
      
      //define the default language
      defaultLocale: 'en',
      
      // define a custom cookie name to parse locale settings from 
      cookie: 'i18n'
});

app.use(i18n.init);

//Middleware to pass the Current User info to every request
app.use(function(req,res,next) {
   res.locals.currentUser   = req.user;
   res.locals.error         = req.flash('error');
   res.locals.success       = req.flash('success');
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
    let brandArray = [];
   
   function contains(ar, obj) {
        for (let i = 0; i < ar.length; i++) {
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
app.use(userRoutes);
app.use(categoryRoutes);
app.use(productRoutes);
app.use(adminRoutes);
app.use(commentRoutes);


//Language Routes
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


app.get('/send',function(req,res){

    let smtpTransport = nodemailer.createTransport("SMTP",{
        host: 'smtp.gmail.com',
        secureConnection: false,
        port: 587,
        auth: {
            user: 'mr.thantsintoe@gmail.com', //Sender Email id
            pass: 'Patoe149201031' //Sender Email Password
        }
    });
    
    async.waterfall([function(callback) {
        // let myHTML = new ejs({url: '/email.ejs'});
        let data = "Thantsintoe";
        
        ejs.renderFile('views/emails/ordershipped.ejs',{name: "Pa Pa"},function(err,html) {
            if(err) console.log(err);
            console.log(html);
            callback(null,html);
        });    
    },function(html,callback) {
        
        let mailOptions = {
            from: 'mr.thantsintoe@gmail.com',
            to: 'mr.thantsintoe@gmail.com', 
            subject: 'Hello ✔', 
            html: html
        };
        
        console.log(mailOptions);
        
        smtpTransport.sendMail(mailOptions, function(error, response){
            if(error){
                console.log(error);
                res.end("error");
            } else {
                console.log("Message sent: " + response.message);
                res.end("sent");
            }
        });
    }]);
});

app.use(indexRoutes);

app.listen(process.env.PORT,process.env.IP,function() {
    console.log("Ecommerce Server is running...");
});