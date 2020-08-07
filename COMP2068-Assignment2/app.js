'use strict';
var debug = require('debug');
var express = require('express');
var session = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcryptjs');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
const MongoClient = require('mongodb').MongoClient;
const MongoStore = require('connect-mongo')(session);
var mongoose = require('mongoose');
const uri = "mongodb+srv://prabhat:123@cluster0.m3dos.mongodb.net/prabhat?retryWrites=true&w=majority";
try {
    mongoose.connect(uri, { useNewUrlParser: true });
    var db = mongoose.connection;
    db.on('error', function (err) {
        console.log(err);
    });
    db.once('open', function (callback) {
        console.log('Connected to MongoDB');
    });
} catch (err) {
    console.log("Error : " + err);
}
var routes = require('./routes/index');
var users = require('./routes/users');
var userModel = require('./models/user');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'secrettexthere',
    saveUninitialized: true,
    resave: true
}));

app.use(passport.initialize());
app.use(passport.session());
app.use('/', routes);
app.use('/users', users);

passport.serializeUser(function (user, done) {
    done(null, user.id)
});


passport.deserializeUser(function (id, done) {
    userModel.findById(id, function (err, user) {
        done(err, user);
    });
});

passport.use(new LocalStrategy(
    function (username, password, done) {
        userModel.findOne({
            username: username
        }, function (err, user) {
            if (err) {
                return done(err);
            }

            if (!user) {
                return done(null, false);
            }
            if (!bcrypt.compareSync(password, user.password)) {
                return done(null, false);
            }

            return done(null, user);
        });
    }
));

app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function () {
    debug('Express server listening on port ' + server.address().port);
});
