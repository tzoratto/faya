'use strict';

/**
 * @file Contains a Passport authentication strategy.
 */

const LocalStrategy = require('passport-local').Strategy;
const User = require('../../models/user');

/**
 * Exports a local strategy used to authenticate with a Faya account.
 */
module.exports = new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
    function (req, email, password, done) {

        User.findOneAndUpdate({
            'local.email': email,
            'local.valid': true
        }, {$set: {lastAccess: new Date()}}, function (err, user) {
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