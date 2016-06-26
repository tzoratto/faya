'use strict';

var TwitterStrategy = require('passport-twitter').Strategy;
const configAuth = require('../auth');
var User = require('../../models/user');

module.exports = new TwitterStrategy({

        consumerKey: configAuth.twitterAuth.consumerKey,
        consumerSecret: configAuth.twitterAuth.consumerSecret,
        callbackURL: configAuth.twitterAuth.callbackURL,
        passReqToCallback: true

    },
    function (req, token, tokenSecret, profile, done) {
        process.nextTick(function () {
            User.findOne({'twitter.id': profile.id}, function (err, user) {
                if (err) {
                    return done(err);
                }

                if (req.user) {
                    if (user) {
                        return done(null, null, {message: req.__('account.twitterAlreadyLinked')})
                    }
                    user = req.user;

                    user.twitter.id = profile.id;
                    user.twitter.token = token;
                    user.twitter.username = profile.username;
                    user.twitter.displayName = profile.displayName;

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
                        newUser.twitter.id = profile.id;
                        newUser.twitter.token = token;
                        newUser.twitter.username = profile.username;
                        newUser.twitter.displayName = profile.displayName;

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