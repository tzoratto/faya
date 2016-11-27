'use strict';

/**
 * @file Controllers related to token checking.
 */

const sendResponse = require('../utils/sendResponse');
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

    checkToken(req.user._id, namespaceName, tokenValue, function (err, valid, token) {
        if (err) {
            return next(err);
        }
        if (token) {
            token.createTokenHit(req.ip, req.get('User-Agent'), function (err) {
                if (err) {
                    return next(err);
                }
                sendResponse.successJSON(res, 200);
            });
        } else {
            if (valid) {
                sendResponse.successJSON(res, 200);
            } else {
                sendResponse.failureJSON(res, 200);
            }
        }
    });
};