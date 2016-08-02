'use strict';

/**
 * @file Controllers related to users.
 */

const JsonResponse = require('../models/response/jsonResponse');
const User = require('../models/user');
var mongoose = require('mongoose');
const Namespace = require('../models/namespace');
const Token = require('../models/token');

/**
 * Lists all the users matching an optional filter.
 *
 * @param req
 * @param res
 * @param next
 */
exports.list = function (req, res, next) {
    var query = req.query.q ? req.query.q : '.*';
    var regex = new RegExp(query);
    User.find({
        $or: [
            {'local.email': {$regex: regex}},
            {'facebook.email': {$regex: regex}},
            {'facebook.name': {$regex: regex}},
            {'google.email': {$regex: regex}},
            {'google.name': {$regex: regex}},
            {'twitter.displayName': {$regex: regex}},
            {'twitter.username': {$regex: regex}}
        ]
    }, '-local.password' +
        ' -local.token' +
        ' -facebook.id' +
        ' -facebook.token' +
        ' -google.id' +
        ' -google.token' +
        ' -twitter.id' +
        ' -twitter.token' +
        ' -apiKeyPairs', function (err, users) {
        if (err) {
            return next(err);
        }
        res.status(200).json((new JsonResponse()).makeSuccess(users));
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
        ' -local.token' +
        ' -facebook.id' +
        ' -facebook.token' +
        ' -google.id' +
        ' -google.token' +
        ' -twitter.id' +
        ' -twitter.token';
    if (req.user.admin) {
        projection += ' -apiKeyPairs';
    }
    User.findById(req.params.id, projection, function (err, user) {
        if (err) {
            return next(err);
        }
        if (user) {
            res.status(200).json((new JsonResponse()).makeSuccess(user));
        } else {
            res.status(404).json((new JsonResponse()).makeFailure('', res.__('user.notFound')));
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
                res.status(400).json((new JsonResponse()).makeFailure('', res.__('user.cannotDeleteAdmin')));
                return;
            }
            user.remove(function (err) {
                if (err) {
                    return next(err);
                }
                res.status(200).json((new JsonResponse()).makeSuccess());
            });
        } else {
            res.status(404).json((new JsonResponse()).makeFailure('', res.__('user.notFound')));
        }
    });
};