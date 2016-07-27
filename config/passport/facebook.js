'use strict';

/**
 * @file Contains a Passport authentication strategy.
 */

const FacebookStrategy = require('passport-facebook').Strategy;
const configAuth = require('../auth');
var User = require('../../models/user');
const Setting = require('../../models/setting');

/**
 * Exports a Facebook strategy used to authenticate through Facebook.
 */
module.exports = new FacebookStrategy({
        clientID: configAuth.facebookAuth.clientID,
        clientSecret: configAuth.facebookAuth.clientSecret,
        callbackURL: configAuth.facebookAuth.callbackURL,
        profileFields: ['id', 'emails', 'name'],
        passReqToCallback: true

    },
    function (req, token, refreshToken, profile, done) {
        process.nextTick(function () {
            loadUser(profile, done, function (user) {
                loadSetting(done, function (setting) {
                    if (req.user) {
                        //If the user is already logged in, that means we try to link its account with a Facebook account.
                        if (user) {
                            return done(null, null, {message: req.__('account.facebookAlreadyLinked')})
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
    User.findOne({'facebook.id': profile.id}, function (err, user) {
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
    user.facebook.id = profile.id;
    user.facebook.token = token;
    user.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
    user.facebook.email = profile.emails[0].value;

    user.save(function (err) {
        if (err) {
            return done(err);
        }
        return done(null, user);
    });
}
