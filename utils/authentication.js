'use strict';

/**
 * @file Contains utilities related to authentication.
 */

const JsonResponse = require('../models/response/jsonResponse');
const appConfig = require('../config/app');
var jwt = require('jsonwebtoken');

var passport;

/**
 * Middleware that checks if the user is logged in with a valid token.
 *
 * @param req
 * @param res
 * @param next
 * @return {*}
 */
var loggedIn = function(req, res, next) {
    return passport.authenticate('jwt', { session: false})(req, res, next);
};

/**
 * Middleware that checks if the user is logged in either with a token or with an API key.
 *
 * @param req
 * @param res
 * @param next
 * @return {*}
 */
var loggedInForApi = function (req, res, next) {
    passport.authenticate('jwt', { session: false}, function (err, user, info) {
            if (err || !user) {
                return passport.authenticate('basic', {session: false})(req, res, next);
            } else {
                req.user = user;
                return next();
            }
        })(req, res, next);
};

/**
 * Middleware that checks if the logged user is an admin.
 *
 * @param req
 * @param res
 * @param next
 * @return {*}
 */
var isAdmin = function (req, res, next) {
    if (req.user && req.user.admin) {
        return next();
    } else {
        res.status(403).json((new JsonResponse()).makeFailure());
    }
};

/**
 * Middleware that checks if the logged in user is either an admin or has the right to manipulate the user with given id.
 * This middleware is to be used only on user-specific routes.
 *
 * @param req
 * @param res
 * @param next
 * @return {*}
 */
var isAdminOrIsSubject = function (req, res, next) {
    if (req.user.id === req.params.id) {
        return next();
    } else {
        isAdmin(req, res, next);
    }
};

/**
 * Makes a JWT.
 *
 * @param user
 * @param callback
 */
var makeToken = function (user, callback) {
    jwt.sign(user.toDTO(), appConfig.jwtSecret,
        {
            expiresIn: '7 days'
        },
        callback);
};

module.exports = function(passportInstance) {
    var exp = {};

    passport = passportInstance;

    exp.isLoggedIn = loggedIn;
    exp.isLoggedInForApi = loggedInForApi;
    exp.isAdmin = isAdmin;
    exp.isAdminOrIsSubject = isAdminOrIsSubject;
    exp.makeToken = makeToken;

    return exp;
};