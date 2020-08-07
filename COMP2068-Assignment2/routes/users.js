'use strict';
var express = require('express');
var router = express.Router();
var passport = require('passport');
var userModel = require('../models/user');
var bcrypt = require('bcryptjs');
router.get('/', function (req, res) {
    try {
        userModel.find({}, function (err, foundUsers) {
            console.log(err);
            console.log(foundUsers);
            res.render('users', { cat: foundUsers, user: req.user });
        });
    }
    catch (err) {
        console.log(err);
    }
});
module.exports = router;
