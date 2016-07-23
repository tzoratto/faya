'use strict';

/**
 * @file Controllers related to token checking.
 */

const JsonResponse = require('../models/response/jsonResponse');
const checkToken = require('../utils/checkToken');

/**
 * Checks if a token is valid against a specific namespace.
 *
 * @param req
 * @param res
 * @param next
 */
exports.check = function (req, res, next) {
    var namespaceName = req.query.namespace;
    var tokenValue = req.query.token;

    checkToken(req.user._id, namespaceName, tokenValue, function (err, valid) {
        if (err) {
            return next(err);
        }
        if (valid) {
            res.status(200).json((new JsonResponse()).makeSuccess());
        } else {
            res.status(200).json((new JsonResponse()).makeFailure());
        }
    });
};