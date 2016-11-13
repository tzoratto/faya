'use strict';

/**
 * @file Controller related to authentication.
 */

const sendResponse = require('../utils/sendResponse');
const User = require('../models/user');
const sendMail = require('../utils/sendMail');
const uuid = require('uuid');
var authUtils;

var passport;

/**
 * Login with a Faya account.
 *
 * @param req
 * @param res
 * @param next
 */
var login = function (req, res, next) {
    passport.authenticate('local-login', {badRequestMessage: res.__('account.missingCredentials')}, function (err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            sendResponse.failureJSON(res, 401, info.message);
        }
        else {
            authUtils.makeToken(user, function (err, token) {
                if (err) {
                    return next(err);
                }
                sendResponse.successJSON(res, 200, token);
            });
        }
    })(req, res, next);
};

/**
 * Creates a new Faya account.
 *
 * @param req
 * @param res
 * @param next
 */
var signup = function (req, res, next) {
    passport.authenticate('local-signup', {badRequestMessage: res.__('account.missingCredentials')}, function (err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            sendResponse.failureJSON(res, 400, info.message);
        }
        else {
            var mailContent = res.__('account.validationLink', `${req.header('referer')}?email=${user.local.email}&token=${user.local.token}`);
            sendMail(user.local.email, res.__('account.validationMailSubject'), mailContent, function (err) {
                if (err) {
                    return next(err);
                } else {
                    sendResponse.successJSON(res, 200);
                }
            });
        }
    })(req, res, next);
};

/**
 * Validates a Faya account.
 *
 * @param req
 * @param res
 * @param next
 */
var signupValidation = function (req, res, next) {
    var email = req.query.email;
    var token = req.query.token;

    User.findOne({
        'local.email': email,
        'local.token': token
    }, function (err, user) {
        if (err) {
            return next(err);
        }
        if (user) {
            user.local.valid = true;
            user.local.token = undefined;
            user.save(function (err) {
                if (err) {
                    return next(err);
                }
                authUtils.makeToken(user, function (err, token) {
                    if (err) {
                        return next(err);
                    }
                    sendResponse.successJSON(res, 200, token);
                });
            });
        } else {
            sendResponse.failureJSON(res, 400, res.__('account.validationInvalid'));
        }
    });
};

/**
 * Sends a link to reset user's password.
 *
 * @param req
 * @param res
 * @param next
 */
var passwordReset = function (req, res, next) {
    var email = req.body.email;

    User.findOne({
        'local.email': email,
        'local.valid': true
    }, function (err, user) {
        if (err) {
            return next(err);
        }
        if (user) {
            user.local.token = uuid.v4();
            user.save(function (err) {
                if (err) {
                    return done(err);
                }
                var mailContent = res.__('account.passwordResetLink', `${req.header('referer')}?email=${user.local.email}&token=${user.local.token}`);
                sendMail(user.local.email, res.__('account.passwordResetMailSubject'), mailContent, function (err) {
                    if (err) {
                        return next(err);
                    } else {
                        sendResponse.successJSON(res, 200);
                    }
                });
            });
        } else {
            sendResponse.failureJSON(res, 400, res.__('account.noValidUserFound'));
        }
    });
};

/**
 * Actually reset user's password.
 *
 * @param req
 * @param res
 * @param next
 */
var passwordResetValidation = function (req, res, next) {
    var email = req.body.email;
    var token = req.body.token;
    var password = req.body.password;

    User.findOne({
        'local.email': email,
        'local.token': token,
        'local.valid': true
    }, function (err, user) {
        if (err) {
            return next(err);
        }
        if (user) {
            user.local.password = user.generateHash(password);
            user.local.token = undefined;
            user.save(function (err) {
                if (err) {
                    return next(err);
                }
                authUtils.makeToken(user, function (err, token) {
                    if (err) {
                        return next(err);
                    }
                    sendResponse.successJSON(res, 200, token);
                });
            });
        } else {
            sendResponse.failureJSON(res, 400, res.__('account.validationInvalid'));
        }
    });
};

module.exports = function (passportInstance) {
    var controllers = {};

    passport = passportInstance;
    authUtils = require('../utils/authentication')(passportInstance);

    controllers.login = login;
    controllers.signup = signup;
    controllers.signupValidation = signupValidation;
    controllers.passwordReset = passwordReset;
    controllers.passwordResetValidation = passwordResetValidation;

    return controllers;
};
