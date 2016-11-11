'use strict';

/**
 * @file Controllers related to tokens.
 */

const sendResponse = require('../utils/sendResponse');
const Namespace = require('../models/namespace');
const Token = require('../models/token');
const mongoose = require('mongoose');
const doesTokenBelongTo = require('../utils/doesTokenBelongTo');

/**
 * Lists all the namespace's token matching an optional filter.
 *
 * @param req
 * @param res
 * @param next
 */
exports.list = function (req, res, next) {
    if (!req.query.namespace || mongoose.Types.ObjectId.isValid(req.query.namespace)) {
        var query = req.query.q ? req.query.q : '.*';
        var regex = new RegExp(query);
        var namespaceId = req.query.namespace;
        var namespaceQuery = {
            'user': req.user._id
        };
        if (namespaceId) {
            namespaceQuery['_id'] = namespaceId;
        }
        Namespace.find(namespaceQuery, '_id', function (err, namespaces) {
            if (err) {
                return next(err);
            }
            if (namespaceId && namespaces.length === 0) {
                sendResponse.failureJSON(res, 404, res.__('namespace.notFound'));
                return;
            }
            Token.find({
                'namespace': {$in: namespaces},
                $or: [{'value': {$regex: regex}}, {'description': {$regex: regex}}]
            }, function (err, tokens) {
                if (err) {
                    return next(err);
                }
                sendResponse.successJSON(res, 200, tokens);
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
        sendResponse.failureJSON(res, 404, res.__('namespace.notFound'));
        return;
    }
    Namespace.findOne({'user': req.user._id, '_id': req.body.namespace}, function (err, namespace) {
        if (err) {
            return next(err);
        }
        if (namespace) {
            var token = new Token({
                namespace: req.body.namespace,
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
    ifUserOwnsTheToken(req, res, next, req.user._id, req.params.id, function (token) {
        token.remove(function (err) {
            if (err) {
                return next(err);
            }
            sendResponse.successJSON(res, 200);
        });
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
    ifUserOwnsTheToken(req, res, next, req.user._id, req.params.id, function (token) {
        sendResponse.successJSON(res, 200, token);
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
    ifUserOwnsTheToken(req, res, next, req.user._id, req.params.id, function (token) {
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
    });
};

/**
 * Updates the token's description.
 *
 * @param req
 * @param res
 * @param next
 */
exports.updateDescription = function (req, res, next) {
    ifUserOwnsTheToken(req, res, next, req.user._id, req.params.id, function (token) {
        updateProperty(req, res, next, token, 'description', req.body.description);
    });
};

/**
 * Updates the token's startsAt property.
 *
 * @param req
 * @param res
 * @param next
 */
exports.updateStartsAt = function (req, res, next) {
    ifUserOwnsTheToken(req, res, next, req.user._id, req.params.id, function (token) {
        updateProperty(req, res, next, token, 'startsAt', req.body.startsAt);
    });
};

/**
 * Updates the token's endsAt property.
 *
 * @param req
 * @param res
 * @param next
 */
exports.updateEndsAt = function (req, res, next) {
    ifUserOwnsTheToken(req, res, next, req.user._id, req.params.id, function (token) {
        updateProperty(req, res, next, token, 'endsAt', req.body.endsAt);
    });
};

/**
 * Updates the token's active property.
 *
 * @param req
 * @param res
 * @param next
 */
exports.updateActive = function (req, res, next) {
    ifUserOwnsTheToken(req, res, next, req.user._id, req.params.id, function (token) {
        updateProperty(req, res, next, token, 'active', req.body.active);
    });
};

/**
 * Updates the token's pool property.
 *
 * @param req
 * @param res
 * @param next
 */
exports.updatePool = function (req, res, next) {
    ifUserOwnsTheToken(req, res, next, req.user._id, req.params.id, function (token) {
        updateProperty(req, res, next, token, 'pool', req.body.pool);
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
    if (user) {
        Namespace.find({'user': user}, '_id', function (err, namespaces) {
            if (err) {
                return next(err);
            }
            Token.count({'namespace': {$in: namespaces}}, function (err, count) {
                if (err) {
                    return next(err);
                }
                sendResponse.successJSON(res, 200, {count: count});
            });
        });
    } else {
        Token.count({}, function (err, count) {
            if (err) {
                return next(err);
            }
            sendResponse.successJSON(res, 200, {count: count});
        });
    }
};

/**
 * Calls the callback if the user owns the token and thus can modify it.
 *
 * @param req
 * @param res
 * @param next
 * @param userId
 * @param tokenId
 * @param callback
 */
function ifUserOwnsTheToken(req, res, next, userId, tokenId, callback) {
    doesTokenBelongTo(userId, tokenId, function (err, belongs, token, notFound) {
        if (err) {
            return next(err);
        }
        if (notFound) {
            sendResponse.failureJSON(res, 404, res.__('token.notFound'));
            return;
        }
        if (belongs) {
            callback(token);
        } else {
            sendResponse.failureJSON(res, 403, res.__('token.unauthorized'));
        }
    });
}

/**
 * Updates a single token's property.
 *
 * @param req
 * @param res
 * @param next
 * @param token
 * @param propertyName
 * @param value
 */
function updateProperty(req, res, next, token, propertyName, value) {
    token[propertyName] = value;
    token.save(function (err) {
        if (err) {
            return next(err);
        } else {
            sendResponse.successJSON(res, 200);
        }
    });
}