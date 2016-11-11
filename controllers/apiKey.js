'use strict';

/**
 * @file Controller related to the API key pairs.
 */

const sendResponse = require('../utils/sendResponse');
const mongoose = require('mongoose');


/**
 * Lists all the user's API key pairs.
 *
 * @param req
 * @param res
 * @param next
 */
exports.list = function (req, res, next) {
    sendResponse.successJSON(res, 200, req.user.apiKeyPairs);
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
        sendResponse.successJSON(res, 200, keyPair);
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
    user.deleteApiKeyPair(req.params.id, function (err, user) {
        if (err) {
            return next(err);
        } else if (user) {
            sendResponse.successJSON(res, 200);
        } else {
            sendResponse.failureJSON(res, 404, res.__('account.apiKeyNotFound'));
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
        sendResponse.successJSON(res, 200, keyPair);
    } else {
        sendResponse.failureJSON(res, 404, res.__('account.apiKeyNotFound'));
    }
};