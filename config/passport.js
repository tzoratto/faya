'use strict';

/**
 * @file Configures PassportJS.
 */

var User = require('../models/user');

const configAuth = require('./auth');

const localLogin = require('./passport/localLogin');
const localSignup = require('./passport/localSignup');
const basic = require('./passport/basic');

module.exports = function (passport) {

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            if (user) {
                user.lastAccess = new Date();
                user.save(function(err) {
                    done(err, user);
                });
            } else {
                done(err, user);
            }
        });
    });

    passport.use('local-login', localLogin);
    passport.use('local-signup', localSignup);
    passport.use(basic);

    if (configAuth.facebookAuth.clientID &&
        configAuth.facebookAuth.clientSecret) {
        const facebook = require('./passport/facebook');
        passport.use(facebook);
    }

    if (configAuth.twitterAuth.consumerKey &&
        configAuth.twitterAuth.consumerSecret) {
        const twitter = require('./passport/twitter');
        passport.use(twitter);
    }

    if (configAuth.googleAuth.clientID &&
        configAuth.googleAuth.clientSecret) {
        const google = require('./passport/google');
        passport.use(google);
    }

};