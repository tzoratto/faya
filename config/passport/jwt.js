'use strict';

/**
 * @file Contains a Passport authentication strategy.
 */

const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../../models/user');
const appConfig = require('../app');

/**
 * Exports a JWT strategy used to authenticate with a Faya account.
 */
module.exports = new JwtStrategy({
        jwtFromRequest: ExtractJwt.fromAuthHeader(),
        secretOrKey: appConfig.jwtSecret,
        passReqToCallback: true
    },
    function (req, jwtPayload, done) {

        User.findOneAndUpdate({
            'local.email': jwtPayload.local.email,
            'local.valid': true
        }, {$set: {lastAccess: new Date()}}, function (err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false, {message: req.__('account.noValidUserFound')});
            }
            return done(null, user);
        });

    }
);