'use strict';

/**
 * @file Controllers related to namespaces.
 */

const sendResponse = require('../utils/sendResponse');
const Namespace = require('../models/namespace');
const mongoose = require('mongoose');

/**
 * Lists all the user's namespaces matching an optional filter.
 *
 * @param req
 * @param res
 * @param next
 */
exports.list = function (req, res, next) {
    var query = req.query.q ? req.query.q : '.*';
    var regex = new RegExp(query);
    Namespace.find({
        'user': req.user._id,
        $or: [{'name': {$regex: regex}}, {'description': {$regex: regex}}]
    }, function (err, namespaces) {
        if (err) {
            return next(err);
        }
        sendResponse.successJSON(res, 200, namespaces);
    });
};

/**
 * Creates a new namespace.
 *
 * @param req
 * @param res
 * @param next
 */
exports.create = function (req, res, next) {
    var user = req.user;
    user.createNamespace(req.body.name, req.body.description, function (err, namespace) {
        if (err) {
            return next(err);
        } else {
            sendResponse.successJSON(res, 200, namespace);
        }
    });
};

/**
 * Deletes a namespace.
 *
 * @param req
 * @param res
 * @param next
 */
exports.delete = function (req, res, next) {
    ifUserOwnsTheNamespace(req, res, next, req.user._id, req.params.id, function (namespace) {
        namespace.remove();
        sendResponse.successJSON(res, 200);
    });
};

/**
 * Gets the details of a namespace.
 *
 * @param req
 * @param res
 * @param next
 */
exports.details = function (req, res, next) {
    ifUserOwnsTheNamespace(req, res, next, req.user._id, req.params.id, function (namespace) {
        sendResponse.successJSON(res, 200, namespace);
    });
};

/**
 * Updates the namespace's properties.
 *
 * @param req
 * @param res
 * @param next
 */
exports.update = function (req, res, next) {
    ifUserOwnsTheNamespace(req, res, next, req.user._id, req.params.id, function (namespace) {
        namespace.name = req.body.name;
        namespace.description = req.body.description;
        namespace.save(function (err) {
            if (err) {
                return next(err);
            } else {
                sendResponse.successJSON(res, 200, namespace);
            }
        });
    });
};

/**
 * Calculates the number of namespaces optionally filtered by user.
 *
 * @param req
 * @param res
 * @param next
 */
exports.count = function (req, res, next) {
    var user = req.query.user;
    var filter = {};
    if (user) {
        filter['user'] = user;
    }
    Namespace.count(filter, function (err, count) {
        if (err) {
            return next(err);
        }
        sendResponse.successJSON(res, 200, {count: count});
    });
};

/**
 * Calls the callback if the user owns the namespace and thus can modify it.
 *
 * @param req
 * @param res
 * @param next
 * @param userId
 * @param namespaceId
 * @param callback
 */
function ifUserOwnsTheNamespace(req, res, next, userId, namespaceId, callback) {
    if (mongoose.Types.ObjectId.isValid(namespaceId)) {
        Namespace.findOne({'user': userId, '_id': namespaceId}, function (err, namespace) {
            if (err) {
                return next(err);
            }
            if (namespace) {
                callback(namespace);
            } else {
                sendResponse.failureJSON(res, 404, res.__('namespace.notFound'));
            }
        });
    } else {
        sendResponse.failureJSON(res, 404, res.__('namespace.notFound'));
    }
}