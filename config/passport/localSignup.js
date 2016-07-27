'use strict';

/**
 * @file Contains a Passport authentication strategy.
 */

const LocalStrategy = require('passport-local').Strategy;
const User = require('../../models/user');
const uuid = require('uuid');
const Setting = require('../../models/setting');

/**
 * Exports a local strategy used to create a new Faya account.
 */
module.exports = new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
    function (req, email, password, done) {

        process.nextTick(function () {
            loadUser(email, done, function (user) {
                loadSetting(done, function (setting) {
                    if (user) {
                        if (user.local.valid) {
                            //If this account already exists and is valid.
                            return done(null, false, {message: req.__('account.alreadyExisting')});
                        } else if (user.validPassword(password)) {
                            //If this account already exists but is still invalid.
                            return done(null, user);
                        } else {
                            return done(null, false, {message: req.__('account.badPassword')});
                        }
                    } else {
                        if (req.user) {
                            user = req.user;
                        } else if (setting.subscriptionEnabled) {
                            user = new User();
                        } else {
                            return done(null, null, {message: req.__('app.subscriptionDisabled')});
                        }
                        populateAndSaveUser(user, email, password, done);
                    }
                });
            });
        });
    }
);

/**
 * Loads the corresponding user (if any) and passes it to the callback.
 *
 * @param email
 * @param done - The function to call if something goes wrong.
 * @param callback
 */
function loadUser(email, done, callback) {
    User.findOne({'local.email': email}, function (err, user) {
        if (err) {
            return done(err);
        }
        callback(user);
    });
}

/**
 * Loads the application setting and passes it to the callback.
 *
 * @param done - The function to call if something goes wrong.
 * @param callback
 */
function loadSetting(done, callback) {
    Setting.findOne({}, function (err, setting) {
        if (err || !setting) {
            return done(err, setting);
        } else {
            return callback(setting);
        }
    });
}

/**
 * Populates and saves the user.
 *
 * @param user
 * @param done
 */
function populateAndSaveUser(user, email, password, done) {
    user.local.email = email;
    user.local.password = user.generateHash(password);
    user.local.token = uuid.v4();
    user.local.valid = false;
    user.local.date = Date.now();

    user.save(function (err) {
        if (err) {
            return done(err);
        }
        return done(null, user);
    });
}
