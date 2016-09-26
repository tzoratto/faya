'use strict';

const Setting = require('../models/setting');

/**
 * Inserts the document containing the application settings with default values if not already there.
 *
 * @param callback
 */
module.exports = function (callback) {
    //If setting is absent, insert a new Setting document with default value.
    Setting.findOneAndUpdate({}, {}, {
        upsert: true,
        setDefaultsOnInsert: true
    }, function (err) {
        if (err) {
            return callback(err);
        }
        return callback(null);
    });
};