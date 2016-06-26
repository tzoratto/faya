'use strict';

const FacebookStrategy = require('passport-facebook').Strategy;
const configAuth = require('../auth');
var User = require('../../models/user');

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
                    if (user) {
                        return done(null, null, {message: req.__('account.facebookAlreadyLinked')})
                    }
                    user = req.user;
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
                } else {
                    if (user) {
                        return done(null, user);
                    } else {
                        var newUser = new User();

                        newUser.facebook.id = profile.id;
                        newUser.facebook.token = token;
                        newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
                        newUser.facebook.email = profile.emails[0].value;

                        newUser.save(function (err) {
                            if (err) {
                                return done(err);
                            }
                            return done(null, newUser);
                        });
                    }
                }
            });
        });
    }
);
