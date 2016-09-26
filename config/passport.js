'use strict';

/**
 * @file Configures PassportJS.
 */

var User = require('../models/user');

const localLogin = require('./passport/localLogin');
const localSignup = require('./passport/localSignup');
const basic = require('./passport/basic');

module.exports = function (passport) {

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findByIdAndUpdate(id, {$set: {lastAccess: new Date()}}, function (err, user) {
            done(err, user);
        });
    });

    passport.use('local-login', localLogin);
    passport.use('local-signup', localSignup);
    passport.use(basic);
};