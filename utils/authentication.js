'use strict';

/**
 * @file Contains utilities related to authentication.
 */

const JsonResponse = require('../models/response/jsonResponse');

var passport;

/**
 * Middleware that checks if the user is logged in with a valid session.
 *
 * @param req
 * @param res
 * @param next
 * @return {*}
 */
var loggedIn = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(403).json((new JsonResponse()).makeFailure());
};

/**
 * Middleware that checks if the user has no session.
 *
 * @param req
 * @param res
 * @param next
 * @return {*}
 */
var loggedOff = function(req, res, next) {
    if (req.isAuthenticated()) {
        res.status(403).json((new JsonResponse()).makeFailure());
    } else {
        return next();
    }
};

/**
 * Middleware that checks if the user is logged in either with a session or with an API key.
 *
 * @param req
 * @param res
 * @param next
 * @return {*}
 */
var loggedInForApi = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    else {
        return passport.authenticate('basic', {session: false})(req, res, next);
    }
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

module.exports = function(passportInstance) {
    var exp = {};

    passport = passportInstance;

    exp.isLoggedIn = loggedIn;
    exp.isLoggedOff = loggedOff;
    exp.isLoggedInForApi = loggedInForApi;
    exp.isAdmin = isAdmin;
    exp.isAdminOrIsSubject = isAdminOrIsSubject;

    return exp;
};