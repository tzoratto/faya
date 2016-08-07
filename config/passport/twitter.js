'use strict';

/**
 * @file Contains a Passport authentication strategy.
 */

var TwitterStrategy = require('passport-twitter').Strategy;
const configAuth = require('../auth');
const authUtils = require('./authUtils');

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
        authUtils.handleAuthCallback('twitter', req, token, tokenSecret, profile, done);
    }
);