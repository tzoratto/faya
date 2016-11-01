'use strict';

/**
 * @file Defines the setting model containing application settings.
 *
 */

const mongoose = require('mongoose');

/**
 * Setting Mongoose schema.
 *
 * There must be only one document of this type.
 */
var settingSchema = mongoose.Schema({
    subscriptionEnabled: {
        type: Boolean,
        required: [true, 'setting.subscriptionEnabledRequired'],
        default: true
    }
});

module.exports = mongoose.model('Setting', settingSchema);