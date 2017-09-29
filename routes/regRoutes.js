var express = require('express');
var router = express.Router();
var Message = require('../models').Message
var User = require('../models').User
var client = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
var Group = require('../models').Group;
router.get('/', function(req, res){
  Group.findOne({admin: req.user.id}).populate('regulars').exec(function(err, group){
    Message.find({group: group._id}).populate('sender').exec(function(err, messages){
      group.regulars.unshift(req.user.user);
      res.render('viewmessages', {messages: messages, user_list: group.regulars});
    })
  })

})

router.get('/messages', function(req, res){
  console.log("GETTING IN?");
  Group.findOne({admin: req.user.id}).populate('regulars').exec(function(err, group){
    if(err){
      res.send("No group found");
    } else{
      Message.find({group: group._id}).populate('sender').exec(function(err, messages){
        console.log("MESSAGES", messages);
        res.send({messages: messages});
      })
    }
  })
})

router.get('/users', function(req, res){
  Group.findOne({admin: req.user.id}).populate('regulars').exec(function(err, group){
    if(err){
      res.send("No group found");
    } else{
      group.regulars.unshift(req.user.user);
      console.log("wholeUserArray", group.regulars);
      res.send({users: group.regulars});
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
                  });
              });
              res.end();
            }
          });
        }
      });
    }
  });
});


router.delete('/connection/:username', function(req, res){
  //Go to group that admin is in and remove use from group
  var username = req.params.username;
  Group.findOne({admin: req.user.id}).populate('regulars').exec(function(err, group){
    for(var i =0; i < group.regulars.length; i++){
      if(group.regulars[i].name=== username){
        var numberToSend = group.regulars[i].number
        group.regulars.splice(i, 1);
        group.save(function(err, group){
          var message = client.messages.create({
            to: numberToSend,
            from: "(207) 248-8331",
            body:  "You've been kicked out of " + group.name,
          });
          res.end();
        })
      }
    }
  })

})

module.exports = router;
