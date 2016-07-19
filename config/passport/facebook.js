'use strict';

/**
 * @file Contains a Passport authentication strategy.
 */

const FacebookStrategy = require('passport-facebook').Strategy;
const configAuth = require('../auth');
var User = require('../../models/user');

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
            User.findOne({'facebook.id': profile.id}, function (err, user) {
                if (err) {
                    return done(err);
                }

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
                    user = new User();
                }

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
            });
        });
    }
);
