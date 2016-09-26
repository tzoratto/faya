'use strict';

/**
 * @file Contains utilities to handle passport-based authentication.
 */

const User = require('../../models/user');
const Setting = require('../../models/setting');
const uuid = require('uuid');

/**
 * Loads the corresponding user (if any) and passes it to the callback.
 *
 * @param method
 * @param profile
 * @param done - The function to call if something goes wrong.
 * @param callback
 */
var loadUser = function (method, profile, done, callback) {
    var filter = {};
    if (method !== 'local') {
        filter[method + '.id'] = profile.id;
    } else {
        filter['local.email'] = profile;
    }

    User.findOne(filter, function (err, user) {
        if (err) {
            return done(err);
        }
        callback(user);
    });
};

/**
 * Loads the application setting and passes it to the callback.
 *
 * @param done - The function to call if something goes wrong.
 * @param callback
 */
var loadSetting = function (done, callback) {
    Setting.findOne({}, function (err, setting) {
        if (err || !setting) {
            return done(err, setting);
        } else {
            return callback(setting);
        }
    });
};

/**
 * Populates and saves the user.
 *
 * @param method
 * @param user
 * @param info1
 * @param info2
 * @param done
 */
var populateAndSaveUser = function (method, user, info1, info2, done) {
    if (method === 'local') {
        user.local.email = info1;
        user.local.password = user.generateHash(info2);
        user.local.token = uuid.v4();
        user.local.valid = false;
        user.local.date = Date.now();
    }

    user.save(function (err) {
        if (err) {
            return done(err);
        }
        return done(null, user);
    });
};

exports.loadUser = loadUser;
exports.loadSetting = loadSetting;
exports.populateAndSaveUser = populateAndSaveUser;

