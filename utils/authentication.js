'use strict';

const JsonResponse = require('../models/response/jsonResponse');

module.exports = function(passport) {
    var exp = {};
    
    exp.isLoggedIn = function(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        res.status(403).json((new JsonResponse()).makeFailure());
    };
    
    exp.isLoggedOff = function(req, res, next) {
        if (req.isAuthenticated()) {
            res.status(403).json((new JsonResponse()).makeFailure());
        } else {
            return next();
        }
    };
    
    exp.isLoggedInForApi = function (req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        else {
            return passport.authenticate('basic', {session: false})(req, res, next);
        }
    };
    
    return exp;
};