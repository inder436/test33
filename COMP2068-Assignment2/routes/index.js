'use strict';
var express = require('express');
var router = express.Router();
var passport = require('passport');
var userModel = require('../models/user');
var itemsModel = require('../models/items');
var formidable = require('formidable');
var fs = require('fs');
var path = require('path');
var bcrypt = require('bcryptjs');

router.get('/items', function (req, res) {
    try {
        itemsModel.find({}, function (err, foundItems) {
            console.log(err);
            console.log(foundItems);
            res.render('items', { items: foundItems, user: req.user });
        });
    } catch (err) {
        console.log(err);
    }
});

router.get('/', function (req, res) {
    res.render('index', { user: req.user });
});

router.get('/insert', function (req, res) {
    res.render('insert', { user: req.user });
});

router.post('/insert', function (req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        console.log('Parsed form.');
        const ca = new itemsModel({ name: fields.name, catagory: fields.catagory, size: fields.size });
        ca.save(function (err) {
            console.log(err);
        });
    });
    form.on('error', function (err) {
        console.log(err);
    });
    form.on('end', function (err, fields, files) {
        console.log('uploaded');
        res.redirect('/items');
    });
});

router.get('/update/:id', function (req, res) {
    itemsModel.findById(req.params.id, function (err, foundArticle) {
        if (err) console.log(err);
        res.render('update', { items: foundArticle, user: req.user })
    })
});

router.post('/update', function (req, res) {
    console.log(req.body);
    itemsModel.findByIdAndUpdate(req.body.id, { name: req.body.name, catagory: req.body.catagory, size: req.body.size }, function (err, model) {
        console.log(err);
        res.redirect('/items');
    });
});
router.post('/login', passport.authenticate('local', {
    successRedirect: '/items',
    failureRedirect: '/login',
    failureMessage: 'error'
}));

router.get('/logout', function (req, res) {
    req.session.destroy(function (err) {
        res.redirect('/login');
    });
});
router.post('/register', function (req, res) {
    bcrypt.hash(req.body.password, 10, function (err, hash) {
        var registerUser = {
            username: req.body.username,
            password: hash
        }
        userModel.find({ username: registerUser.username }, function (err, user) {
            if (err) console.log(err);
            if (user.length) console.log('error');
            const newUser = new userModel(registerUser);
            newUser.save(function (err) {
                console.log('Inserting');
                if (err) console.log(err);
                req.login(newUser, function (err) {
                    console.log('error');
                    if (err) console.log(err);
                    return res.redirect('/items');
                });
            });
        });
    })
});
router.get('/register', function (req, res) {
    res.render('register');
});
router.get('/login', function (req, res) {
    res.render('login');
});
module.exports = router;
