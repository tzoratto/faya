'use strict';

/**
 * @file Controllers related to namespaces.
 */

const validationErrors = require('../utils/validationErrors');
const JsonResponse = require('../models/response/jsonResponse');

/**
 * Lists all the user's namespaces matching an optional filter.
 *
 * @param req
 * @param res
 * @param next
 */
exports.list = function (req, res, next) {
    var query = req.query.q;
    var results = req.user.namespaces;
    if (query) {
        var regex = new RegExp(query);
        results = results.filter(function (elem) {
            return regex.test(elem.name) || regex.test(elem.description);
        });
    }
    res.status(200).json((new JsonResponse()).makeSuccess(results));
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
                res.status(500).json((new JsonResponse()).makeFailure(valErrors));
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
};

/**
 * Gets the details of a namespace.
 *
 * @param req
 * @param res
 * @param next
 */
exports.details = function (req, res, next) {
    var user = req.user;
    var namespace = user.namespaces.id(req.params.id);
    if (namespace) {
        res.status(200).json((new JsonResponse()).makeSuccess(namespace));
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
    var user = req.user;
    var namespace = user.namespaces.id(req.params.id);
    if (namespace) {
        namespace.name = req.body.name;
        namespace.description = req.body.description;
        user.save(function (err) {
            if (err) {
                var valErrors = validationErrors(err);
                if (valErrors) {
                    res.status(500).json((new JsonResponse()).makeFailure(valErrors));
                } else {
                    return next(err);
                }
            } else {
                res.status(200).json((new JsonResponse()).makeSuccess(namespace));
            }
        });
    } else {
        res.status(404).json((new JsonResponse()).makeFailure(null, res.__('namespace.notFound')));
    }
};