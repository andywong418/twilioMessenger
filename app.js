//require necessary modules
var express = require('express')
var mongoose = require('mongoose')
var bodyParser = require('body-parser')
var exphbs = require('express-handlebars');
var client = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN)

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
app.engine('hbs', exphbs({defaultLayout: 'main', extname: 'hbs'}));
app.set('view engine', 'hbs');

//ROUTES GO HERE

app.get('/', function(req, res){
  res.send("All good")
})

//add a route that will respond to post requests sent by Twilio via
//webhooks

app.post('/handletext', function(req, res){
  console.log(req.body);
  var message = client.messages.create({
    to: "SENDER_NUMBER",
    from: "MY_TWILIO_NUMBER",
    body: "THIS_PART_IS_UP_TO_YOU",
  })
  res.send(message);
});

//start up our server
var port = process.env.PORT || 3000

app.listen(port)
