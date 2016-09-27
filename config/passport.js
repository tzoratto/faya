'use strict';

/**
 * @file Configures PassportJS.
 */

var User = require('../models/user');

const localLogin = require('./passport/localLogin');
const localSignup = require('./passport/localSignup');
const basic = require('./passport/basic');
const jwt = require('./passport/jwt');

module.exports = function (passport) {
    passport.use('local-login', localLogin);
    passport.use('local-signup', localSignup);
    passport.use(basic);
    passport.use('jwt', jwt);
};