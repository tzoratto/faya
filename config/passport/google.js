'use strict';

/**
 * @file Contains a Passport authentication strategy.
 */

var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const configAuth = require('../auth');
const authUtils = require('./authUtils');

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
        authUtils.handleAuthCallback('google', req, token, refreshToken, profile, done);
    }
);