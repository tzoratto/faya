'use strict';

/**
 * @file Defines the setting model containing application settings.
 *
 */

const mongoose = require('mongoose');
const configAuth = require('../config/auth');

/**
 * Setting Mongoose schema.
 *
 * There must be only one document of this type.
 */
var settingSchema = mongoose.Schema({
    subscriptionEnabled: {
        type: Boolean,
        required: true,
        default: true
    },
    authMethods: {
        facebook: {
            type: Boolean,
            required: true,
            default: Boolean(configAuth.facebookAuth.clientID && configAuth.facebookAuth.clientSecret)
        },
        google: {
            type: Boolean,
            required: true,
            default: Boolean(configAuth.googleAuth.clientID && configAuth.googleAuth.clientSecret)
        },
        twitter: {
            type: Boolean,
            required: true,
            default: Boolean(configAuth.twitterAuth.consumerKey && configAuth.twitterAuth.consumerSecret)
        }
    }
});

module.exports = mongoose.model('Setting', settingSchema);