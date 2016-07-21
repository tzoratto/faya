'use strict';

/**
 * @file Controllers related to tokens.
 */

const JsonResponse = require('../models/response/jsonResponse');

/**
 * Lists all the namespace's token matching an optional filter.
 *
 * @param req
 * @param res
 * @param next
 */
exports.list = function (req, res, next) {
    var query = req.query.q;
    var namespaceId = req.params.namespaceId;
    var results = [];
    if (namespaceId) {
        results = req.user.namespaces.id(namespaceId).tokens;
    } else {
        req.user.namespaces.forEach(function (elem) {
            results = results.concat(elem.tokens);
        });
    }
    if (query) {
        var regex = new RegExp(query);
        results = results.filter(function (elem) {
            return regex.test(elem.value) || regex.test(elem.description);
        });
    }
    res.status(200).json((new JsonResponse()).makeSuccess(results));
};

/**
 * Creates a new token.
 *
 * @param req
 * @param res
 * @param next
 */
exports.create = function (req, res, next) {
    var user = req.user;
    user.namespaces.id(req.params.namespaceId).createToken(req.body.description, req.body.active, function (err, token) {
        if (err) {
            return next(err);
        } else {
            res.status(200).json((new JsonResponse()).makeSuccess(token));
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
    var user = req.user;
    user.namespaces.id(req.params.namespaceId).deleteToken(req.params.id, function (err) {
        if (err) {
            if (err.status !== 404) {
                return next(err);
            } else {
                res.status(404).json((new JsonResponse()).makeFailure(null, res.__('token.notFound')));
            }
        } else {
            res.status(200).json((new JsonResponse()).makeSuccess());
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
    var user = req.user;
    var token = user.namespaces.id(req.params.namespaceId).tokens.id(req.params.id);
    if (token) {
        res.status(200).json((new JsonResponse()).makeSuccess(token));
    } else {
        res.status(404).json((new JsonResponse()).makeFailure(null, res.__('token.notFound')));
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
    var user = req.user;
    var token = user.namespaces.id(req.params.namespaceId).tokens.id(req.params.id);
    if (token) {
        token.description = req.body.description;
        token.active = req.body.active;
        user.save(function (err) {
            if (err) {
                return next(err);
            } else {
                res.status(200).json((new JsonResponse()).makeSuccess(token));
            }
        });
    } else {
        res.status(404).json((new JsonResponse()).makeFailure(null, res.__('token.notFound')));
    }
};