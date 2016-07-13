'use strict';

var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const configAuth = require('../auth');
var User = require('../../models/user');

module.exports = new GoogleStrategy({

        clientID: configAuth.googleAuth.clientID,
        clientSecret: configAuth.googleAuth.clientSecret,
        callbackURL: configAuth.googleAuth.callbackURL,
        passReqToCallback: true

    },
    function (req, token, refreshToken, profile, done) {
        process.nextTick(function () {
            User.findOne({'google.id': profile.id}, function (err, user) {
                if (err) {
                    return done(err);
                }

                if (req.user) {
                    if (user) {
                        return done(null, null, {message: req.__('account.googleAlreadyLinked')})
                    }
                    user = req.user;
                } else {
                    if (user) {
                        return done(null, user);
                    }
                    user = new User();
                }
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
            });
        });
    }
);