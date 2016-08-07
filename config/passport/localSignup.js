'use strict';

/**
 * @file Contains a Passport authentication strategy.
 */

const LocalStrategy = require('passport-local').Strategy;
const User = require('../../models/user');
const authUtils = require('./authUtils');

/**
 * Exports a local strategy used to create a new Faya account.
 */
module.exports = new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
    function (req, email, password, done) {

        process.nextTick(function () {
            authUtils.loadUser('local', email, done, function (user) {
                authUtils.loadSetting(done, function (setting) {
                    if (user) {
                        if (user.local.valid) {
                            //If this account already exists and is valid.
                            return done(null, false, {message: req.__('account.alreadyExisting')});
                        } else if (user.validPassword(password)) {
                            //If this account already exists but is still invalid.
                            return done(null, user);
                        } else {
                            return done(null, false, {message: req.__('account.badPassword')});
                        }
                    } else {
                        if (req.user) {
                            user = req.user;
                        } else if (setting.subscriptionEnabled) {
                            user = new User();
                        } else {
                            return done(null, null, {message: req.__('app.subscriptionDisabled')});
                        }
                        authUtils.populateAndSaveUser('local', user, email, password, done);
                    }
                });
            });
        });
    }
);