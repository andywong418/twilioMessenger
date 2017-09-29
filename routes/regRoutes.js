var express = require('express');
var router = express.Router();
var Message = require('../models').Message
var User = require('../models').User
var client = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

router.get('/', function(req, res){
  User.find({name: {'$ne':"Admin" }}).exec(function(err, users){
    if(!err){
      Message.find().populate("sender").exec(function(err, messages){
        if(!err){
          res.render("viewmessages", {messages: messages, user_list: users})
        }
      });
    }
  });

})

router.get('/messages', function(req, res){
  Message.find().populate("sender").exec(function(err, messages){
    if(!err){
      res.send({messages: messages});
    }
  });
})

router.get('/users', function(req, res){
  User.find({name: {'$ne':"Admin" }}).exec(function(err, users){
    if(!err){
      res.send({users: users});
    }
  });
})

//add a route that will respond to post requests sent by Twilio via
//webhooks


router.post('/grouptext', function(req, res){
  User.findOne({number: "123"}, function(err, userMessage){
    if (userMessage){
      Message.create({sender: userMessage, content: req.body.Body, receivedAt: (new Date()).toLocaleTimeString()}, function(err){
        if(!err){
          User.find(function(err, users){
            if(!err){
              users.forEach(function(user){
                  var message = client.messages.create({
                    to: user.number,
                    from: "(207) 248-8331",
                    body:  "[" + "Admin" + "]: "  + req.body.Body,
                  })

              });
              res.end();
            }
          });
        }
      });
    }
  });
});

module.exports = router;
