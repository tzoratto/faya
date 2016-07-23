'use strict';

const Namespace = require('../models/namespace');
const Token = require('../models/token');

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
        Token.findOneAndUpdate({
            'namespace': namespace._id,
            'value': tokenValue,
            'active': true,
            '$and': [
                {
                    '$or': [
                        {'startsAt': {'$exists': false}},
                        {'startsAt': {'$lt': new Date()}}
                    ]
                },
                {
                    '$or': [
                        {'endsAt': {'$exists': false}},
                        {'endsAt': {'$gte': new Date()}}
                    ]
                }
            ]
        }, {$inc: {'count': 1}}, function (err, token) {
            if (err) {
                return callback(err);
            }
            if (token) {
                return callback(null, true);
            } else {
                return callback(null, false);
            }
        });
    });
};