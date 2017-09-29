var express = require('express');
var router = express.Router();
var Message = require('../models').Message
var User = require('../models').User;
var Group = require('../models').Group;
var client = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

router.post('/receiveText', function(req, res){
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
      }  else if (message.length !== 4){
        var message = client.messages.create({
          to: req.body.From,
          from: "(207) 248-8331",
          body:  "Sorry, you need all the proper inputs.",
        });
        res.end();

      }else{
        console.log(message)
        Group.findOne({name: message[2]}, function(err, group){
          if(!group){
            var message = client.messages.create({
              to: req.body.From,
              from: "(207) 248-8331",
              body:  "Group does not exist",
            });
            res.end();
          }
          else{
            var message = req.body.Body.split(" ");
            User.create({number: req.body.From, name: message[1], imgURL: message[3]}, function(err, user){
                  group.regulars.push(user.id);
                  group.save(function(err, group){
                    if(!err){
                      var message = client.messages.create({
                        to: req.body.From,
                        from: "(207) 248-8331",
                        body: "Hello, thanks for signing up " + user.name + "!",
                      })
                      res.end();
                    }
                  });
            })
          }
        })

      }
    });
  }
  else if (req.body.Body === "Logout"){
    User.remove({number: req.body.From}, function(err, user){
      var message = client.messages.create({
        to: req.body.From,
        from: "(207) 248-8331",
        body: "Thank you, hopefully we will see you again. Good bye!",
      })
      res.end();
    })
  }
  else if (message[0] === "Group"){
    if(message.length !== 2){
      var message = client.messages.create({
        to: req.body.From,
        from: "(207) 248-8331",
        body: "Please include all inputs.",
      })
      res.end();
    }else{
      User.findOne({number: req.body.From}, function(err, user){
        if(!user){
          var message = client.messages.create({
            to: req.body.From,
            from: "(207) 248-8331",
            body: "Please register!",
          })
          res.end();
        } else{
          Group.findOne({name: message[1]}, function(err, group){
            if(!group){
              var message = client.messages.create({
                to: req.body.From,
                from: "(207) 248-8331",
                body: "Group does not exist.",
              })
              res.end();
            } else{
              if(group.regulars.indexOf(user._id.toString()) > -1){
                var message = client.messages.create({
                  to: req.body.From,
                  from: "(207) 248-8331",
                  body: "You're already in group",
                })
                res.end();
              } else{
                group.regulars.push(user._id);
                group.save(function(err, user){
                  var message = client.messages.create({
                    to: req.body.From,
                    from: "(207) 248-8331",
                    body: "You have joined a new group!",
                  })
                  res.end();
                })
              }
            }

          })
        }
      })

    }
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
      else{
        var message = client.messages.create({
          to: req.body.From,
          from: "(207) 248-8331",
          body: "You need to register. Do so by texting: New YOUR_NAME IMAGE_URL"
        })
      }
    });
  }
});

module.exports = router;
