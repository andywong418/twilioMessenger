var express = require('express');
var router = express.Router();
var Message = require('../models').Message
var User = require('../models').User
var client = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

router.get('/', function(req, res){
  Message.find().populate("sender").exec(function(err, messages){
    if(!err){
      res.render("viewmessages", {messages: messages})
    }
  })
})

router.get('/messages', function(req, res){
  Message.find().populate("sender").exec(function(err, messages){
    if(!err){
      res.send({messages: messages});
    }
  })
})

//add a route that will respond to post requests sent by Twilio via
//webhooks

router.post('/handletext', function(req, res){
  console.log(req.body);
  var message = req.body.Body.split(" ")
  if (message[0] === "New"){
    User.findOne({number: req.body.From}, function(err, data){
      var message = req.body.Body.split(" ")
      if(!err && data){
        var message = client.messages.create({
          to: req.body.From,
          from: "(207) 248-8331",
          body:  "Sorry, " + data.name + " already signed up",
        })
        res.end();
      }  else if (message.length !== 3){
        var message = client.messages.create({
          to: req.body.From,
          from: "(207) 248-8331",
          body:  "Sorry, you need all the proper inputs.",
        });
        res.end();

      }else{
        console.log(message)
        User.create({number: req.body.From, name: message[1], imgURL: message[2]}, function(err, user){
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
    });
  }

  else{
    User.findOne({number: req.body.From}, function(err, userMessage){
      if (userMessage){
        Message.create({sender: userMessage, content: req.body.Body, receivedAt: (new Date()).toLocaleTimeString()}, function(err){
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
        });
      }
    });
  }
});

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
