'use strict';

/**
 * @file Controllers related to tokens.
 */

const JsonResponse = require('../models/response/jsonResponse');
const Namespace = require('../models/namespace');
const Token = require('../models/token');
const mongoose = require('mongoose');
const validationErrors = require('../utils/validationErrors');
const doesTokenBelongTo = require('../utils/doesTokenBelongTo');

/**
 * Lists all the namespace's token matching an optional filter.
 *
 * @param req
 * @param res
 * @param next
 */
exports.list = function (req, res, next) {
    if (!req.params.namespaceId || mongoose.Types.ObjectId.isValid(req.params.namespaceId)) {
        var query = req.query.q ? req.query.q : '.*';
        var regex = new RegExp(query);
        var namespaceId = req.params.namespaceId;
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
                res.status(404).json((new JsonResponse()).makeFailure(res.__('namespace.notFound')));
                return;
            }
            namespaces = namespaces.map(function (elem) {
                return elem._id;
            });
            Token.find({
                'namespace': {$in: namespaces},
                $or: [{'value': {$regex: regex}}, {'description': {$regex: regex}}]
            }, function (err, tokens) {
                if (err) {
                    return next(err);
                }
                res.status(200).json((new JsonResponse()).makeSuccess(tokens));
            });
        });
    } else {
        res.status(404).json((new JsonResponse()).makeFailure(res.__('namespace.notFound')));
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
    if (mongoose.Types.ObjectId.isValid(req.params.namespaceId)) {
        Namespace.findOne({'user': req.user._id, '_id': req.params.namespaceId}, function (err, namespace) {
            if (err) {
                return next(err);
            }
            namespace.createToken(req.body.description,
                req.body.active,
                req.body.startsAt,
                req.body.endsAt,
                req.body.pool,
                function (err, token) {
                    if (err) {
                        var valErrors = validationErrors(err);
                        if (valErrors) {
                            res.status(400).json((new JsonResponse()).makeFailure(valErrors));
                            return;
                        } else {
                            return next(err);
                        }
                    }
                    res.status(200).json((new JsonResponse()).makeSuccess(token));
                });
        });
    } else {
        res.status(404).json((new JsonResponse()).makeSuccess(res.__('namespace.notFound')));
    }
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
            res.status(200).json((new JsonResponse()).makeSuccess());
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
        res.status(200).json((new JsonResponse()).makeSuccess(token));
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
                var valErrors = validationErrors(err);
                if (valErrors) {
                    res.status(400).json((new JsonResponse()).makeFailure(valErrors));
                } else {
                    return next(err);
                }
            } else {
                res.status(200).json((new JsonResponse()).makeSuccess(token));
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
        token.description = req.body.description;
        token.save(function (err) {
            if (err) {
                var valErrors = validationErrors(err);
                if (valErrors) {
                    res.status(400).json((new JsonResponse()).makeFailure(valErrors));
                } else {
                    return next(err);
                }
            } else {
                res.status(200).json((new JsonResponse()).makeSuccess());
            }
        });
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
        token.startsAt = req.body.startsAt;
        token.save(function (err) {
            if (err) {
                var valErrors = validationErrors(err);
                if (valErrors) {
                    res.status(400).json((new JsonResponse()).makeFailure(valErrors));
                } else {
                    return next(err);
                }
            } else {
                res.status(200).json((new JsonResponse()).makeSuccess());
            }
        });
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
        token.endsAt = req.body.endsAt;
        token.save(function (err) {
            if (err) {
                var valErrors = validationErrors(err);
                if (valErrors) {
                    res.status(400).json((new JsonResponse()).makeFailure(valErrors));
                } else {
                    return next(err);
                }
            } else {
                res.status(200).json((new JsonResponse()).makeSuccess());
            }
        });
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
        token.active = req.body.active;
        token.save(function (err) {
            if (err) {
                var valErrors = validationErrors(err);
                if (valErrors) {
                    res.status(400).json((new JsonResponse()).makeFailure(valErrors));
                } else {
                    return next(err);
                }
            } else {
                res.status(200).json((new JsonResponse()).makeSuccess());
            }
        });
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
        token.pool = req.body.pool;
        token.save(function (err) {
            if (err) {
                var valErrors = validationErrors(err);
                if (valErrors) {
                    res.status(400).json((new JsonResponse()).makeFailure(valErrors));
                } else {
                    return next(err);
                }
            } else {
                res.status(200).json((new JsonResponse()).makeSuccess());
            }
        });
    });
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
            res.status(404).json((new JsonResponse()).makeFailure(null, res.__('token.notFound')));
            return;
        }
        if (belongs) {
            callback(token);
        } else {
            res.status(403).json((new JsonResponse()).makeFailure(res.__('token.unauthorized')));
        }
    });
}