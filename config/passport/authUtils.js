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
    if (method === 'facebook') {
        user.facebook.id = info2.id;
        user.facebook.token = info1;
        user.facebook.name = info2.name.givenName + ' ' + info2.name.familyName;
        user.facebook.email = info2.emails[0].value;
    } else if (method === 'google') {
        user.google.id = info2.id;
        user.google.token = info1;
        user.google.name = info2.displayName;
        user.google.email = info2.emails[0].value;
    } else if (method === 'twitter') {
        user.twitter.id = info2.id;
        user.twitter.token = info1;
        user.twitter.username = info2.username;
        user.twitter.displayName = info2.displayName;
    } else if (method === 'local') {
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

/**
 * Handles the parameters returned by authentication providers.
 *
 * @param method
 * @param req
 * @param token
 * @param refreshToken
 * @param profile
 * @param done
 */
var handleAuthCallback = function (method, req, token, refreshToken, profile, done) {
    process.nextTick(function () {
        loadUser(method, profile, done, function (user) {
            loadSetting(done, function (setting) {
                if (req.user) {
                    //If the user is already logged in, that means we try to link its account with a social media account.
                    if (user) {
                        return done(null, null, {message: req.__('account.' + method + 'AlreadyLinked')})
                    }
                    user = req.user;
                } else {
                    //Otherwise, we have to create a new account.
                    if (user) {
                        return done(null, user);
                    }
                    if (setting.subscriptionEnabled) {
                        user = new User();
                    } else {
                        return done(null, null, {message: req.__('app.subscriptionDisabled')});
                    }
                }

                populateAndSaveUser(method, user, token, profile, done);
            });
        });
    });
};

exports.loadUser = loadUser;
exports.loadSetting = loadSetting;
exports.populateAndSaveUser = populateAndSaveUser;
exports.handleAuthCallback = handleAuthCallback;

