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

module.exports = function(passportInstance) {
    var exp = {};

    passport = passportInstance;

    exp.isLoggedIn = loggedIn;
    exp.isLoggedOff = loggedOff;
    exp.isLoggedInForApi = loggedInForApi;
    
    return exp;
};