'use strict';

/**
 * @file Contains a Passport authentication strategy.
 */

var TwitterStrategy = require('passport-twitter').Strategy;
const configAuth = require('../auth');
var User = require('../../models/user');

/**
 * Exports a Twitter strategy used to authenticate through Twitter.
 */
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
                    //If the user is already logged in, that means we try to link its account with a Twitter account.
                    if (user) {
                        return done(null, null, {message: req.__('account.twitterAlreadyLinked')})
                    }
                    user = req.user;
                } else {
                    //Otherwise, we have to create a new account.
                    if (user) {
                        return done(null, user);
                    }
                    user = new User();
                }
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
            });
        });
    }
);