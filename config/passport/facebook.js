'use strict';

/**
 * @file Contains a Passport authentication strategy.
 */

const FacebookStrategy = require('passport-facebook').Strategy;
const configAuth = require('../auth');
const authUtils = require('./authUtils');


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
        authUtils.handleAuthCallback('facebook', req, token, refreshToken, profile, done);
    }
);