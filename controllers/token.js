'use strict';

/**
 * @file Controllers related to tokens.
 */

const JsonResponse = require('../models/response/jsonResponse');
const Namespace = require('../models/namespace');
const Token = require('../models/token');
const mongoose = require('mongoose');
const validationErrors = require('../utils/validationErrors');

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
            namespace.createToken(req.body.description, req.body.active, function (err, token) {
                if (err) {
                    return next(err);
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
    if (!mongoose.Types.ObjectId.isValid(req.params.namespaceId)) {
        res.status(404).json((new JsonResponse()).makeFailure(null, res.__('namespace.notFound')));
        return;
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        res.status(404).json((new JsonResponse()).makeFailure(null, res.__('token.notFound')));
        return;
    }

    Namespace.findOne({'user': req.user._id, '_id': req.params.namespaceId}, function (err, namespace) {
        if (err) {
            return next(err);
        }
        if (namespace) {
            namespace.deleteToken(req.params.id, function (err) {
                if (err) {
                    return next(err);
                }
                res.status(200).json((new JsonResponse()).makeSuccess());
            });
        } else {
            res.status(404).json((new JsonResponse()).makeFailure(null, res.__('namespace.notFound')));
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
    if (mongoose.Types.ObjectId.isValid(req.params.namespaceId)) {
        if (mongoose.Types.ObjectId.isValid(req.params.id)) {
            Namespace.findOne({'user': req.user._id, '_id': req.params.namespaceId}, function (err, namespace) {
                if (err) {
                    return next(err);
                }
                if (!namespace) {
                    res.status(404).json((new JsonResponse()).makeFailure(null, res.__('namespace.notFound')));
                    return;
                }
                Token.findOne({'namespace': namespace._id, '_id': req.params.id}, function (err, token) {
                    if (err) {
                        return next(err);
                    }
                    if (token) {
                        res.status(200).json((new JsonResponse()).makeSuccess(token));
                    } else {
                        res.status(404).json((new JsonResponse()).makeFailure(null, res.__('token.notFound')));
                    }
                });
            });
        } else {
            res.status(404).json((new JsonResponse()).makeFailure(null, res.__('token.notFound')));
        }
    } else {
        res.status(404).json((new JsonResponse()).makeFailure(null, res.__('namespace.notFound')));
    }
};

/**
 * Updates the token's properties.
 *
 * @param req
 * @param res
 * @param next
 */
exports.update = function (req, res, next) {
    if (!mongoose.Types.ObjectId.isValid(req.params.namespaceId)) {
        res.status(404).json((new JsonResponse()).makeFailure(null, res.__('namespace.notFound')));
        return;
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        res.status(404).json((new JsonResponse()).makeFailure(null, res.__('token.notFound')));
        return;
    }
    Namespace.findOne({'user': req.user._id, '_id': req.params.namespaceId}, function (err, namespace) {
        if (err) {
            return next(err);
        }
        if (!namespace) {
            res.status(404).json((new JsonResponse()).makeFailure(null, res.__('namespace.notFound')));
            return;
        }
        Token.findOne({'namespace': namespace._id, '_id': req.params.id}, function (err, token) {
            if (err) {
                return next(err);
            }
            if (!token) {
                res.status(404).json((new JsonResponse()).makeFailure(null, res.__('token.notFound')));
                return;
            }
            token.description = req.body.description;
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
                    res.status(200).json((new JsonResponse()).makeSuccess(token));
                }
            });
        });
    });
};