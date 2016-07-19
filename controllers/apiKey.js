'use strict';

/**
 * @file Controller related to the API key pairs.
 */

const JsonResponse = require('../models/response/jsonResponse');


/**
 * Lists all the user's API key pairs.
 *
 * @param req
 * @param res
 * @param next
 */
exports.list = function (req, res, next) {
    res.status(200).json((new JsonResponse()).makeSuccess(req.user.apiKeyPairs));
};

/**
 * Create a new API key pair.
 *
 * @param req
 * @param res
 * @param next
 */
exports.create = function (req, res, next) {
    var user = req.user;
    user.createApiKeyPair(function (err, keyPair) {
        if (err) {
            return next(err);
        }
        res.status(200).json((new JsonResponse()).makeSuccess(keyPair));
    });
};

/**
 * Delete an API key pair.
 *
 * @param req
 * @param res
 * @param next
 */
exports.delete = function (req, res, next) {
    var user = req.user;
    user.deleteApiKeyPair(req.params.id, function (err) {
        if (err) {
            if (err.status !== 404) {
                return next(err);
            } else {
                res.status(404).json((new JsonResponse()).makeFailure(null, res.__('account.apiKeyNotFound')));
            }
        } else {
            res.status(200).json((new JsonResponse()).makeSuccess());
        }
    });
};

/**
 * Get the details of an API key pair.
 *
 * @param req
 * @param res
 * @param next
 */
exports.details = function (req, res, next) {
    var user = req.user;
    var keyPair = user.apiKeyPairs.id(req.params.id);
    if (keyPair) {
        res.status(200).json((new JsonResponse()).makeSuccess(keyPair));
    } else {
        res.status(404).json((new JsonResponse()).makeFailure(null, res.__('account.apiKeyNotFound')));
    }
};