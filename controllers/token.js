'use strict';

/**
 * @file Controllers related to tokens.
 */

const sendResponse = require('../utils/sendResponse');
const Namespace = require('../models/namespace');
const Token = require('../models/token');
const mongoose = require('mongoose');

/**
 * Lists all the namespace's token matching an optional filter.
 *
 * @param req
 * @param res
 * @param next
 */
exports.list = function (req, res, next) {
    if (!req.query.namespace || mongoose.Types.ObjectId.isValid(req.query.namespace)) {
        var query = req.query.q;
        var regex;
        var limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
        var page = req.query.page ? parseInt(req.query.page, 10) : 1;
        var offset = limit * (page - 1);
        var sort = req.query.sort;
        var namespaceId = req.query.namespace;
        var criteria = {
            'user': req.user._id
        };
        if (namespaceId) {
            criteria['namespace'] = namespaceId;
        }

        if (query) {
            try {
                regex = new RegExp(query);
            } catch(err) {
                return sendResponse.failureJSON(res, 400, res.__('misc.regexError'));
            }
            criteria['$or'] = [{'value': {$regex: regex}}, {'description': {$regex: regex}}];
        }

        Token.find(criteria)
            .skip(offset)
            .limit(limit)
            .sort(sort)
            .exec(function (err, tokens) {
                if (err) {
                    return next(err);
                }
                Token.count(criteria, function (err, count) {
                    if (err) {
                        return next(err);
                    }
                    sendResponse.successPaginatedJSON(res, 200, tokens, count, page);
                });
            });
    } else {
        sendResponse.failureJSON(res, 404, res.__('namespace.notFound'));
    }
};

/**
 * Creates a new token.
 *
 * @param req
 * @param res
 * @param next
 */
exports.create = function (req, res, next) {
    if (!mongoose.Types.ObjectId.isValid(req.body.namespace)) {
        return sendResponse.failureJSON(res, 404, res.__('namespace.notFound'));
    }
    Namespace.findOne({'user': req.user._id, '_id': req.body.namespace}, function (err, namespace) {
        if (err) {
            return next(err);
        }
        if (namespace) {
            var token = new Token({
                namespace: req.body.namespace,
                user: req.user._id,
                description: req.body.description,
                active: req.body.active,
                startsAt: req.body.startsAt,
                endsAt: req.body.endsAt,
                pool: req.body.pool
            });
            token.save(function (err, token) {
                if (err) {
                    return next(err);
                }
                sendResponse.successJSON(res, 200, token);
            })
        } else {
            sendResponse.failureJSON(res, 404, res.__('namespace.notFound'));
        }
    });
};

/**
 * Deletes a token.
 *
 * @param req
 * @param res
 * @param next
 */
exports.delete = function (req, res, next) {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return sendResponse.failureJSON(res, 404, res.__('token.notFound'));
    }
    Token.remove({'user': req.user._id, '_id': req.params.id}, function (err, token) {
        if (err) {
            return next(err);
        }
        if (token) {
            sendResponse.successJSON(res, 200);
        } else {
            sendResponse.failureJSON(res, 404, res.__('token.notFound'));
        }
    });
};

/**
 * Gets the details of a token.
 *
 * @param req
 * @param res
 * @param next
 */
exports.details = function (req, res, next) {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return sendResponse.failureJSON(res, 404, res.__('token.notFound'));
    }
    Token.findOne({'user': req.user._id, '_id': req.params.id}, function (err, token) {
        if (err) {
            return next(err);
        }
        if (token) {
            sendResponse.successJSON(res, 200, token);
        } else {
            sendResponse.failureJSON(res, 404, res.__('token.notFound'));
        }
    });
};

/**
 * Updates the token's properties.
 *
 * @param req
 * @param res
 * @param next
 */
exports.update = function (req, res, next) {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return sendResponse.failureJSON(res, 404, res.__('token.notFound'));
    }
    Token.findOne({'user': req.user._id, '_id': req.params.id}, function (err, token) {
        if (err) {
            return next(err);
        }
        if (token) {
            token.description = req.body.description;
            token.active = req.body.active;
            token.startsAt = req.body.startsAt;
            token.endsAt = req.body.endsAt;
            token.pool = req.body.pool;
            token.save(function (err) {
                if (err) {
                    return next(err);
                } else {
                    sendResponse.successJSON(res, 200, token);
                }
            });
        } else {
            sendResponse.failureJSON(res, 404, res.__('token.notFound'));
        }
    });
};

/**
 * Calculates the number of tokens optionally filtered by user.
 *
 * @param req
 * @param res
 * @param next
 */
exports.count = function (req, res, next) {
    var user = req.query.user;
    var criteria = {};

    if (user) {
        criteria['user'] = user;
    }
    Token.count(criteria, function (err, count) {
        if (err) {
            return next(err);
        }
        sendResponse.successJSON(res, 200, {count: count});
    });
};
