'use strict';

/**
 * @file Controllers related to users.
 */

const sendResponse = require('../utils/sendResponse');
const User = require('../models/user');
var mongoose = require('mongoose');

/**
 * Lists all the users matching an optional filter.
 *
 * @param req
 * @param res
 * @param next
 */
exports.list = function (req, res, next) {
    var query = req.query.q;
    var regex;
    var criteria = {};

    if (query) {
        regex = new RegExp(query);
        criteria['$or'] = [
            {'local.email': {$regex: regex}}
        ];
    }
    User.find(criteria, '-local.password' +
        ' -local.token' +
        ' -apiKeyPairs', function (err, users) {
        if (err) {
            return next(err);
        }
        sendResponse.successJSON(res, 200, users);
    });
};

/**
 * Gets the details of a user.
 *
 * @param req
 * @param res
 * @param next
 */
exports.details = function (req, res, next) {
    var projection = '-local.password' +
        ' -local.token';
    if (req.user.admin) {
        projection += ' -apiKeyPairs';
    }
    User.findById(req.params.id, projection, function (err, user) {
        if (err) {
            return next(err);
        }
        if (user) {
            sendResponse.successJSON(res, 200, user);
        } else {
            sendResponse.failureJSON(res, 404, res.__('user.notFound'));
        }
    });
};

/**
 * Deletes a user.
 *
 * @param req
 * @param res
 * @param next
 */
exports.delete = function (req, res, next) {
    User.findById(req.params.id, function (err, user) {
        if (err) {
            return next(err);
        }
        if (user) {
            if (user.admin) {
                sendResponse.failureJSON(res, 400, res.__('user.cannotDeleteAdmin'));
                return;
            }
            user.remove(function (err) {
                if (err) {
                    return next(err);
                }
                sendResponse.successJSON(res, 200);
            });
        } else {
            sendResponse.failureJSON(res, 404, res.__('user.notFound'));
        }
    });
};