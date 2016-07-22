'use strict';

/**
 * @file Controllers related to namespaces.
 */

const validationErrors = require('../utils/validationErrors');
const JsonResponse = require('../models/response/jsonResponse');
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
        res.status(200).json((new JsonResponse()).makeSuccess(namespaces));
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
            var valErrors = validationErrors(err);
            if (valErrors) {
                res.status(400).json((new JsonResponse()).makeFailure(valErrors));
            } else {
                return next(err);
            }
        } else {
            res.status(200).json((new JsonResponse()).makeSuccess(namespace));
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
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
        var user = req.user;
        user.deleteNamespace(req.params.id, function (err) {
            if (err) {
                if (err.status !== 404) {
                    return next(err);
                } else {
                    res.status(404).json((new JsonResponse()).makeFailure(null, res.__('namespace.notFound')));
                }
            } else {
                res.status(200).json((new JsonResponse()).makeSuccess());
            }
        });
    } else {
        res.status(404).json((new JsonResponse()).makeFailure(null, res.__('namespace.notFound')));
    }
};

/**
 * Gets the details of a namespace.
 *
 * @param req
 * @param res
 * @param next
 */
exports.details = function (req, res, next) {
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
        Namespace.findOne({'user': req.user._id, '_id': req.params.id}, function (err, namespace) {
            if (err) {
                return next(err);
            }
            if (namespace) {
                res.status(200).json((new JsonResponse()).makeSuccess(namespace));
            } else {
                res.status(404).json((new JsonResponse()).makeFailure(null, res.__('namespace.notFound')));
            }
        });
    } else {
        res.status(404).json((new JsonResponse()).makeFailure(null, res.__('namespace.notFound')));
    }
};

/**
 * Updates the namespace's properties.
 *
 * @param req
 * @param res
 * @param next
 */
exports.update = function (req, res, next) {
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
        Namespace.findOne({'user': req.user._id, '_id': req.params.id}, function (err, namespace) {
            if (err) {
                return next(err);
            }
            if (!namespace) {
                res.status(404).json((new JsonResponse()).makeFailure(null, res.__('namespace.notFound')));
                return;
            }
            namespace.name = req.body.name;
            namespace.description = req.body.description;
            namespace.save(function (err) {
                if (err) {
                    var valErrors = validationErrors(err);
                    if (valErrors) {
                        res.status(400).json((new JsonResponse()).makeFailure(valErrors));
                    } else {
                        return next(err);
                    }
                } else {
                    res.status(200).json((new JsonResponse()).makeSuccess(namespace));
                }
            });
        });
    } else {
        res.status(404).json((new JsonResponse()).makeFailure(null, res.__('namespace.notFound')));
    }
};