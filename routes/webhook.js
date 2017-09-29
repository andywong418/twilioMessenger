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
  else if (message[0] === "Logout"){
    //Check if user registered
    User.findOne({number: req.body.From}, function(err, user){
      if(!user){
        var message = client.messages.create({
          to: req.body.From,
          from: "(207) 248-8331",
          body: "Please register now!",
        })
        res.end();

      } else{
        // Check if correct number of arguments
        var message = req.body.Body.split(" ")
        if(message.length !== 2){
          var message = client.messages.create({
            to: req.body.From,
            from: "(207) 248-8331",
            body: "Include correct number of arguments!",
          })
          res.end();

        }else{
            //Check if group exists
            Group.findOne({name: message[1]}, function(err, group){
              if(!group){
                var message = client.messages.create({
                  to: req.body.From,
                  from: "(207) 248-8331",
                  body: "Group does not exist!",
                })
                res.end();

              }else{
                //Check if user in group
                if(group.regulars.indexOf(user._id.toString()) === -1){
                  var message = client.messages.create({
                    to: req.body.From,
                    from: "(207) 248-8331",
                    body: "You are not in group!",
                  })
                  res.end();

                }else{
                  // Logout of group
                  group.regulars.splice(group.regulars.indexOf(user._id.toString()),1);
                  group.save(function(err, group){
                    var message = client.messages.create({
                      to: req.body.From,
                      from: "(207) 248-8331",
                      body: "You have left the group!",
                    })
                    res.end();

                  });
                }
              }
            })
        }
      }
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
        var message = req.body.Body.split(" ");
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
  else if(message[0] === 'Msg'){
    //message case
    var group = message[1];
    //1. Are they registered?
    //2. Do they have right number of arguments
    //3. Does group exist
    //4. Are they in group.
    //6. Cool! send message!

    User.findOne({number: req.body.From}, function(err, user){
      if(!user){
        var message = client.messages.create({
          to: req.body.From,
          from: "(207) 248-8331",
          body: "You need to register. Do so by texting: New YOUR_NAME IMAGE_URL"
        });
        res.end()
      } else{
        var message = req.body.Body.split(" ");
        if(message.length < 3){
          var message = client.messages.create({
            to: req.body.From,
            from: "(207) 248-8331",
            body: "You need at least one word!"
          });
          res.end();
        } else{
          Group.findOne({name: message[1]}).populate('regulars').populate({
            path: 'admin',
            populate: {
              path: 'user',
              model: 'User'
            }
          }).exec(function(err, group){
            console.log("group regulars", group.regulars, user._id);
            if(group.regulars.indexOf(user._id.toString()) === -1){
              var message = client.messages.create({
                to: req.body.From,
                from: "(207) 248-8331",
                body: "You have to join the group."
              });
              res.end();
            } else{
              var msg = req.body.Body.split(" ").slice(2).join();
              console.log("Send message", msg);
              Message.create({sender: user._id, content: msg}, function(err, message){
                if(!err){
                  group.regulars.push(group.admin.user);
                  console.log("group regulars", group.regulars);
                  var sentFrom = group.regulars.reduce((name, x) => x.number === req.body.From ? x.name : name, "Error");
                  console.log("sent from", sentFrom);
                  group.regulars.forEach(function(user){
                    if(user.name !== sentFrom){
                      var message = client.messages.create({
                        to: user.number,
                        from: "(207) 248-8331",
                        body:  "[" + sentFrom + "]: " + msg,
                      })
                    }
                  });
                  res.end();
                }
              })
            }
          })
        }
      }
    })

    // User.findOne({number: req.body.From}, function(err, userMessage){
    //   if (userMessage){
    //     Message.create({sender: userMessage, content: req.body.Body, receivedAt: (new Date()).toLocaleTimeString()}, function(err){
    //       if(!err){
    //         User.find(function(err, users){
    //           if(!err){
    //             var sentFrom = users.reduce((name, x) => x.number === req.body.From ? x.name : name, "Error");
    //             users.forEach(function(user){
    //               if (user.name !== sentFrom){
    //                 var message = client.messages.create({
    //                   to: user.number,
    //                   from: "(207) 248-8331",
    //                   body:  "[" + sentFrom + "]: "  + req.body.Body,
    //                 })
    //               }
    //             });
    //             res.end();
    //           }
    //         });
    //       }
    //     });
    //   }
    //   else{
    //     var message = client.messages.create({
    //       to: req.body.From,
    //       from: "(207) 248-8331",
    //       body: "You need to register. Do so by texting: New YOUR_NAME IMAGE_URL"
    //     });
    //     res.end();
    //   }
    // });
  } else{
    var message = client.messages.create({
      to: req.body.From,
      from: "(207) 248-8331",
      body: "Valid commands New, Group, Logout, Msg"
    });
    res.end();
  }
});

module.exports = router;
