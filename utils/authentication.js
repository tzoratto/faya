'use strict';

const JsonResponse = require('../models/response/jsonResponse');

var passport;

var loggedIn = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(403).json((new JsonResponse()).makeFailure());
};

var loggedOff = function(req, res, next) {
    if (req.isAuthenticated()) {
        res.status(403).json((new JsonResponse()).makeFailure());
    } else {
        return next();
    }
};

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