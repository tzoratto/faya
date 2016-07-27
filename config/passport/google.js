'use strict';

/**
 * @file Contains a Passport authentication strategy.
 */

var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const configAuth = require('../auth');
var User = require('../../models/user');
const Setting = require('../../models/setting');

/**
 * Exports a Google strategy used to authenticate through Google.
 */
module.exports = new GoogleStrategy({

        clientID: configAuth.googleAuth.clientID,
        clientSecret: configAuth.googleAuth.clientSecret,
        callbackURL: configAuth.googleAuth.callbackURL,
        passReqToCallback: true

    },
    function (req, token, refreshToken, profile, done) {
        process.nextTick(function () {
            loadUser(profile, done, function (user) {
                loadSetting(done, function (setting) {
                    if (req.user) {
                        //If the user is already logged in, that means we try to link its account with a Google account.
                        if (user) {
                            return done(null, null, {message: req.__('account.googleAlreadyLinked')})
                        }
                        user = req.user;
                    } else {
                        //Otherwise, we have to create a new account.
                        if (user) {
                            return done(null, user);
                        }
                        if (setting.subscriptionEnabled) {
                            user = new User();
                        } else {
                            return done(null, null, {message: req.__('app.subscriptionDisabled')});
                        }
                    }
                    populateAndSaveUser(user, token, profile, done);
                });
            });
        });
    }
);

/**
 * Loads the corresponding user (if any) and passes it to the callback.
 *
 * @param profile
 * @param done - The function to call if something goes wrong.
 * @param callback
 */
function loadUser(profile, done, callback) {
    User.findOne({'google.id': profile.id}, function (err, user) {
        if (err) {
            return done(err);
        }
        callback(user);
    });
}

/**
 * Loads the application setting and passes it to the callback.
 *
 * @param done - The function to call if something goes wrong.
 * @param callback
 */
function loadSetting(done, callback) {
    Setting.findOne({}, function (err, setting) {
        if (err || !setting) {
            return done(err, setting);
        } else {
            return callback(setting);
        }
    });
}

/**
 * Populates and saves the user.
 *
 * @param user
 * @param token
 * @param profile
 * @param done
 */
function populateAndSaveUser(user, token, profile, done) {
    user.google.id = profile.id;
    user.google.token = token;
    user.google.name = profile.displayName;
    user.google.email = profile.emails[0].value;

    user.save(function (err) {
        if (err) {
            return done(err);
        }
        return done(null, user);
    });
}