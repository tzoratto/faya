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
        User.findOneAndUpdate({
            'apiKeyPairs.keyId': keyId,
            'apiKeyPairs.keySecret': keySecret
        }, {$set: {lastAccess: new Date()}}, function (err, user) {
            return done(err, user);
        });
    }
);
