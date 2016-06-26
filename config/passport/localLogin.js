'use strict';

const LocalStrategy = require('passport-local').Strategy;
const User = require('../../models/user');

module.exports = new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
    function (req, email, password, done) {

        User.findOne({'local.email': email, 'local.valid': true}, function (err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false, {message: req.__('account.noValidUserFound')});
            }
            if (!user.validPassword(password)) {
                return done(null, false, {message: req.__('account.badPassword')});
            }
            return done(null, user);
        });

    }
);