//require necessary modules
var express = require('express')
var mongoose = require('mongoose')
var bodyParser = require('body-parser')
var exphbs = require('express-handlebars');
var client = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
var path = require('path');
var routes = require('./routes/regRoutes.js');
var auth = require('./routes/auth');
var webhook = require('./routes/webhook');
var User = require('./models').User
var Admin = require('./models').Admin;
var Group = require('./models').Group;
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
//setup mongoose connection
mongoose.connection.on('error', function() {
  console.log('error connecting to database')
})
mongoose.connection.on('connected', function() {
  console.log('succesfully connected to database')
})


//setup application configurations
var app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use(express.static(path.join(__dirname, 'public')));

// Add Admin account if not yet added

// Setup the Passport Stuff



mongoose.connect(process.env.MONGODB_URI);
app.use(session({
  secret: 'keyboard cat'
}));

// Tell Passport how to set req.user
passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  Admin.findById(id).populate('user').exec(function(err, user) {
    done(err, user);
  });
});

// Tell passport how to read our user models
passport.use(new LocalStrategy(function(username, password, done) {
  // Find the user with the given username
  Admin.findOne({ username: username }, function (err, user) {
    // if there's an error, finish trying to authenticate (auth failed)
    if (err) {
      console.log(err);
      return done(err);
    }
    // if no user present, auth failed
    if (!user) {
      console.log(user);
      return done(null, false);
    }
    // if passwords do not match, auth failed
    if (user.password !== password) {
      return done(null, false);
    }
    // auth has has succeeded
    return done(null, user);
  });
}));
//regular person signs up.
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: 'http://localhost:3000/auth/facebook/callback',
  profileFields: ['id', 'displayName', 'location', 'gender', 'photos', 'hometown'],
  scope: ['user_birthday', 'user_location', 'user_hometown']
}, function(accessToken, refreshToken, profile, done){
  console.log("CALLBACK", profile._json);
  User.findOne({facebookId: profile.id}, function(err, user){
    if(!user){
      //sort into new group;

      User.create({imgURL: profile.photos[0].value, name: profile.displayName, facebookId: profile.id}, function(err, user){
        console.log("LOCATION", profile._json.location.name);
        Group.find({$or: [{location: profile._json.location.name}, {gender: profile.gender}]}, function(err, groups){
          console.log("GROUPS", groups);
          if(groups.length > 0){
            console.log("ADDED TO GROUP");
            var rand = Math.floor(Math.random() * groups.length);
            groups[rand].regulars.push(user.id);
            groups[rand].save(function(err, group){
              done(null, user);
            })
          } else{
            done(null, null);
          }

        })
      })

    } else{
      console.log("WHAT", user);
      done(null, user);
    }
  })

}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', webhook);
app.use('/', auth(passport));
app.use('/', function(req, res, next){
  if (!req.user) {
    res.redirect('/login');
  } else {
    next();
  }
});
app.use('/', routes);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

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


module.exports = app;



// //start up our server
// var port = process.env.PORT || 3000
//
// app.listen(port)
