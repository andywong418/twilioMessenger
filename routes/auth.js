var express = require('express');
var router = express.Router();
var Admin = require('../models').Admin

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
    Admin.create({username: req.body.username, password: req.body.password}, function(err){
      res.redirect("/login");
    })
  });

  router.get("/logout", function(req, res){
    req.logout();
    res.redirect("/login");
  });

  return router;
}
