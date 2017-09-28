//require necessary modules
var express = require('express')
var mongoose = require('mongoose')
var bodyParser = require('body-parser')
var exphbs = require('express-handlebars');
var client = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
var Message = require('./models').Message
var User = require('./models').User

//setup mongoose connection
mongoose.connection.on('error', function() {
  console.log('error connecting to database')
})
mongoose.connection.on('connected', function() {
  console.log('succesfully connected to database')
})
mongoose.connect(process.env.MONGODB_URI)

//setup application configurations
var app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

//ROUTES GO HERE

app.get('/', function(req, res){
  res.render("viewmessages")
})

//add a route that will respond to post requests sent by Twilio via
//webhooks

app.post('/handletext', function(req, res){
  var message = req.body.Body.split(" ")
  if (message[0] === "New"){
    User.create({number: req.body.From, name: message[1]}, function(err, user){
      if(!err){
        var message = client.messages.create({
          to: req.body.From,
          from: "(207) 248-8331",
          body: "Hello, thanks for signing up " + user.name + "!",
        })
        res.end();
      }
    })
  }
  else{
    Message.create({from: req.body.From, content: req.body.Body}, function(err){
      if(!err){
        User.find(function(err, users){
          if(!err){
            var sentFrom = users.reduce((name, x) => x.number === req.body.From ? x.name : name, "Error");
            users.forEach(function(user){
              if (user.name !== sentFrom){
                var message = client.messages.create({
                  to: user.number,
                  from: "(207) 248-8331",
                  body:  "[" + sentFrom + "]: "  + req.body.Body,
                })

              }

            });
            res.end();
          }
        });
      }
    })
  }



});

//start up our server
var port = process.env.PORT || 3000

app.listen(port)
