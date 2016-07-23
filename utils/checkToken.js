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
            'value': tokenValue
        }, {$inc: {'count': 1}}, function (err, token) {
            if (err) {
                return callback(err);
            }
            if (token && token.isValid()) {
                return callback(null, true);
            } else {
                return callback(null, false);
            }
        });
    });
};