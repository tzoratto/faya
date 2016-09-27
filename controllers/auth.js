'use strict';

/**
 * @file Controller related to authentication.
 */

const JsonResponse = require('../models/response/jsonResponse');
const User = require('../models/user');
const sendMail = require('../utils/sendMail');
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
            res.status(401).json((new JsonResponse()).makeFailure(null, info.message));
        }
        else {
            authUtils.makeToken(user, function (err, token) {
                if (err) {
                    return next(err);
                }
                res.status(200).json((new JsonResponse()).makeSuccess(token));
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
            res.status(400).json((new JsonResponse()).makeFailure(null, info.message));
        }
        else {
            var mailContent = res.__('account.validationLink', req.header('referer') + '?email=' + user.local.email + '&token=' + user.local.token);
            sendMail(user.local.email, res.__('account.validationMailSubject'), mailContent, function (err) {
                if (err) {
                    return next(err);
                } else {
                    res.status(200).json((new JsonResponse()).makeSuccess());
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
                    res.status(200).json((new JsonResponse()).makeSuccess(token));
                });
            });
        } else {
            res.status(400).json((new JsonResponse()).makeFailure(null, res.__('account.validationInvalid')));
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

    return controllers;
};
