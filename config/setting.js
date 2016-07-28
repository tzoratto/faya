'use strict';

const Setting = require('../models/setting');
const configAuth = require('./auth');

/**
 * Inserts the document containing the application settings with default values if not already there.
 *
 * @param callback
 */
module.exports = function (callback) {
    var isFacebookEnabled = configAuth.facebookAuth.clientID && configAuth.facebookAuth.clientSecret;
    var isGoogleEnabled = configAuth.googleAuth.clientID && configAuth.googleAuth.clientSecret;
    var isTwitterEnabled = configAuth.twitterAuth.consumerKey && configAuth.twitterAuth.consumerSecret;

    //If setting is absent, insert a new Setting document with default value.
    //Else, update authMethods.* properties.
    Setting.findOneAndUpdate({}, {
        'authMethods.facebook': isFacebookEnabled,
        'authMethods.google': isGoogleEnabled,
        'authMethods.twitter': isTwitterEnabled
    }, {
        upsert: true,
        setDefaultsOnInsert: true
    }, function (err) {
        if (err) {
            return callback(err);
        }
        return callback(null);
    });
};