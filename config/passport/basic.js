'use strict';

/**
 * @file Contains a Passport authentication strategy.
 */

var BasicStrategy = require('passport-http').BasicStrategy;
var User = require('../../models/user');

/**
 * Exports a basic strategy used to authenticate API calls.
 */
module.exports = new BasicStrategy(
    function (keyId, keySecret, done) {
        User.findOne({
            'apiKeyPairs.keyId': keyId,
            'apiKeyPairs.keySecret': keySecret
        }, function (err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false);
            }
            user.lastAccess = new Date();
            user.save(function () {
                return done(null, user);
            });
        });
    }
);
