'use strict';

/**
 * @file Controllers related to users.
 */

const sendResponse = require('../utils/sendResponse');
const User = require('../models/user');

/**
 * Lists all the users matching an optional filter.
 *
 * @param req
 * @param res
 * @param next
 */
exports.list = function (req, res, next) {
    var query = req.query.q;
    var limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
    var page = req.query.page ? parseInt(req.query.page, 10) : 1;
    var offset = limit * (page - 1);
    var sort = req.query.sort;
    var regex;
    var criteria = {};

    if (query) {
        try {
            regex = new RegExp(query);
        } catch(err) {
            return sendResponse.failureJSON(res, 400, res.__('misc.regexError'));
        }
        criteria['$or'] = [
            {'local.email': {$regex: regex}}
        ];
    }

    User.find(criteria, '-local.password' +
        ' -local.token' +
        ' -apiKeyPairs')
        .skip(offset)
        .limit(limit)
        .sort(sort)
        .exec(function (err, users) {
            if (err) {
                return next(err);
            }
            User.count(criteria, function (err, count) {
                if (err) {
                    return next(err);
                }
                sendResponse.successPaginatedJSON(res, 200, users, count, page);
            });
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