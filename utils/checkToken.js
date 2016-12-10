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
        async.parallel([
            function (callback) {
                checkTokensWithoutPool(userId, namespace._id, tokenValue, callback);
            },
            function (callback) {
                checkTokensWithPool(userId, namespace._id, tokenValue, callback);
            }
        ], function (err, results) {
            if (err) {
                return callback(err);
            }
            let token = results[0].token || results[1].token;
            let valid = false;
            if (results[0].valid || results[1].valid) {
                valid = true;
            }
            return callback(null, valid, token);
        });
    });
};

/**
 * Checks tokens that aren't pool-based.
 *
 * @param userId
 * @param namespaceId
 * @param tokenValue
 * @param callback
 */
function checkTokensWithoutPool(userId, namespaceId, tokenValue, callback) {
    Token.findOneAndUpdate({
        'user': userId,
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
            return callback(null, {valid: true, token: token});
        } else {
            Token.findOne({
                'namespace': namespaceId,
                'value': tokenValue
            }, function (err, token) {
                if (err) {
                    return callback(err);
                }
                callback(null, {valid: false, token: token});
            });
        }
    });
}

/**
 * Checks tokens that are pool-based.
 *
 * @param userId
 * @param namespaceId
 * @param tokenValue
 * @param callback
 */
function checkTokensWithPool(userId, namespaceId, tokenValue, callback) {
    Token.findOneAndUpdate({
        'user': userId,
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
            return callback(null, {valid: true, token: token});
        } else {
            Token.findOne({
                'namespace': namespaceId,
                'value': tokenValue
            }, function (err, token) {
                if (err) {
                    return callback(err);
                }
                return callback(null, {valid: false, token: token});
            });
        }
    });
}