'use strict';

const LocalStrategy = require('passport-local').Strategy;
const User = require('../../models/user');
const uuid = require('uuid');

module.exports = new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
    function (req, email, password, done) {

        process.nextTick(function () {
            User.findOne({'local.email': email}, function (err, user) {
                if (err) {
                    return done(err);
                }
                if (user) {
                    if (user.local.valid) {
                        return done(null, false, {message: req.__('account.alreadyExisting')});
                    } else if (user.validPassword(password)) {
                        return done(null, user);
                    } else {
                        return done(null, false, {message: req.__('account.badPassword')});
                    }
                } else {
                    if (req.user) {
                        user = req.user;
                    } else {
                        user = new User();
                    }
                    user.local.email = email;
                    user.local.password = user.generateHash(password);
                    user.local.token = uuid.v4();
                    user.local.valid = false;
                    user.local.date = Date.now();

                    user.save(function (err) {
                        if (err) {
                            return done(err);
                        }
                        return done(null, user);
                    });
                }
            });
        });
    }
);
