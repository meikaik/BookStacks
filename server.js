// server.js

// ======================== BASE SETUP & DATABASE CONNECTION ======================== //
// call the packages needed
var express = require('express');       // import web server
var bodyParser = require('body-parser');    // import bodyParse to read json+urlencoded
var logger = require('morgan');                 // easy logging
var cookieParser = require('cookie-parser');    // parsing cookies

// set up MongoDB and Mongoose ORM to talk to MongoDB
var mongo = require('mongodb');                       // require mongo
var mongoose = require('mongoose');                   // require mongoose

// require facebook
var FB = require('./node_modules/fb/fb');
var fbconfig = require('./fbconfig');

// import async-nodejs
var async = require('./node_modules/async/dist/async.js');

// check for facebook app credentials
if(!fbconfig.facebook.appId || !fbconfig.facebook.appSecret) {
    throw new Error('facebook appId and appSecret required in config.js');
}

// import mongoose schemas
require('./models/Post-Model');                   // import mongoose model 'Rent' for rental posts
require('./models/User-Model');

// establish a connection to mongo and display results message
mongoose.connect('mongodb://localhost:27017/carpools');   // mongoose connect to location where mongo is running, and the db to use
var db = mongoose.connection;                         
db.on('error', console.error.bind(console, 'Error connecting to MongoDB via Mongoose'));
db.once('open', function(){
  console.log('Connected to MongoDB via Mongoose!');
});


// ======================== APP DEFAULTS ======================== //
// instantiate web server
var app = express();        

// enabled CORS 
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// fulfils pre-flight/promise request by sending a 200 status for every OPTIONS request
/*app.options('*', function(req, res) {
    res.send(200);
});*/

// configure view engine
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public')); 

// configure app to use bodyParser()
// this will let us get the data from a POST in json or urlencoded 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Run app on port 3000 (localhost:3000)
var port = process.env.PORT || 3000;      

// ======================== ROUTING ======================== //
// get instance of express router
var router = express.Router();

// route middleware that will happen on every request
// middleware is used to process things before your route executes them, useful for form validation, logging...etc
router.use(function(req, res, next){
  // log each request to the console
  console.log(req.method, req.url);
  // continue doing what we were doing and go to the route
  next();
})

// inject external routing 
router.use(require('./routes/Posts-Route'));

// apply the routes to our application
app.use('/', router);     

// ======================== ERROR HANDLING ======================== //
/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


// ======================== START THE SERVER ======================== //
app.listen(port);
console.log('App is running on localhost:' + port);

// export this server.js file
module.exports = app;