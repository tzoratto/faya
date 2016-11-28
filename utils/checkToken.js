'use strict';

const Namespace = require('../models/namespace');
const Token = require('../models/token');
const async = require('async');

/**
 * Checks if a token is valid against a namespace and for a given user.
 *
 * @param userId
 * @param namespaceName
 * @param tokenValue
 * @param callback
 */
module.exports = function (userId, namespaceName, tokenValue, callback) {
    Namespace.findOne({'user': userId, 'name': namespaceName}, function (err, namespace) {
        if (err) {
            return callback(err);
        }
        if (!namespace) {
            return callback(null, false);
        }
        async.waterfall([
            function (callback) {
                //Checks if the token matches a valid token non pool-based.
                checkTokensWithoutPool(namespace._id, tokenValue, callback);
            },
            function (valid, token, callback) {
                if (valid) {
                    //The token matches a valid token non pool-based.
                    return callback(null, true, token);
                }
                //The token doesn't match a valid token non pool-based so let's see
                //if it matches a valid token pool-based.
                checkTokensWithPool(namespace._id, tokenValue, callback);
            }
        ], function (err, valid, token) {
            if (err) {
                return callback(err);
            }
            return callback(null, valid, token);
        });
    });
};

/**
 * Checks tokens that aren't pool-based.
 *
 * @param namespaceId
 * @param tokenValue
 * @param callback
 */
function checkTokensWithoutPool(namespaceId, tokenValue, callback) {
    Token.findOneAndUpdate({
        'namespace': namespaceId,
        'value': tokenValue,
        'active': true,
        '$and': [
            {
                '$or': [
                    {'startsAt': null},
                    {'startsAt': {'$lt': new Date()}}
                ]
            },
            {
                '$or': [
                    {'endsAt': null},
                    {'endsAt': {'$gt': new Date()}}
                ]
            }
        ],
        'pool': null
    }, {$inc: {'count': 1}}, function (err, token) {
        if (err) {
            return callback(err);
        }
        if (token) {
            return callback(null, true, token);
        } else {
            Token.findOne({
                'namespace': namespaceId,
                'value': tokenValue
            }, function (err, token) {
                if (err) {
                    return callback(err);
                }
                callback(null, false, token);
            });
        }
    });
}

/**
 * Checks tokens that are pool-based.
 *
 * @param namespaceId
 * @param tokenValue
 * @param callback
 */
function checkTokensWithPool(namespaceId, tokenValue, callback) {
    Token.findOneAndUpdate({
        'namespace': namespaceId,
        'value': tokenValue,
        'active': true,
        '$and': [
            {
                '$or': [
                    {'startsAt': null},
                    {'startsAt': {'$lt': new Date()}}
                ]
            },
            {
                '$or': [
                    {'endsAt': null},
                    {'endsAt': {'$gt': new Date()}}
                ]
            },
            {
                'pool': {'$gt': 0}
            }
        ]
    }, {$inc: {'count': 1, 'pool': -1}}, function (err, token) {
        if (err) {
            return callback(err);
        }
        if (token) {
            return callback(null, true, token);
        } else {
            Token.findOne({
                'namespace': namespaceId,
                'value': tokenValue
            }, function (err, token) {
                if (err) {
                    return callback(err);
                }
                return callback(null, false, token);
            });
        }
    });
}