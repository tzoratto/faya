'use strict';

const mongoose = require('mongoose');
const Token = require('../models/token');

/**
 * Checks if a token belongs to a given user.
 *
 * @param userId
 * @param tokenId
 * @param callback - With parameters : err, belongs, token, notFound.
 */
module.exports = function (userId, tokenId, callback) {
    if (!mongoose.Types.ObjectId.isValid(tokenId)) {
        return callback(null, false, null, true);
    }
    Token.findById(tokenId, function (err, token) {
        if (err) {
            return callback(err);
        }
        if (token) {
            token.belongsToUser(userId, callback);
        } else {
            callback(null, false, null, true);
        }
    });
};