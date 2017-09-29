var express = require('express');
var router = express.Router();
var Admin = require('../models').Admin
var Group = require('../models').Group;
var User = require('../models').User;
module.exports = function(passport) {
  router.get("/login", function(req, res){
    res.render("login");
  });

  router.post('/login',
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

  router.get("/signup", function(req, res){
    res.render("signup");
  });

  router.post("/signup", function(req, res){
    console.log(req.body);
    Group.findOne({name: req.body.group}, function(err, group){
      if(group){
        res.send("Group already exists!")
      } else{
        User.findOne({number: '+1' + req.body.phone}, function(err, user){
          if(user){
            res.send("User already exists");
          } else{
            User.create({number: '+1' + req.body.phone, imgURL: req.body.imgURL, name: req.body.username}, function(err, user){
              Admin.create({username: req.body.username, password: req.body.password, user: user._id}, function(err, admin){
                Group.create({name: req.body.group, admin: admin._id, groupImgURL: req.body.groupImgURL}, function(err, group){
                  res.redirect('/login');
                })
              })
            })

          }
        })
      }
    })

  });

  router.get("/logout", function(req, res){
    req.logout();
    res.redirect("/login");
  });

  return router;
}
