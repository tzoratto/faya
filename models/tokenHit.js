'use strict';

/**
 * @file Defines the tokenHit model.
 */

const mongoose = require('mongoose');

/**
 * TokenHit Mongoose schema.
 */
var tokenHitSchema = mongoose.Schema({
    token: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Token',
        required: [true, 'tokenHit.tokenRequired']
    },
    namespace: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Namespace',
        required: [true, 'tokenHit.namespaceRequired']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User',
        required: [true, 'tokenHit.userRequired']
    },
    ip: String,
    date: Date,
    userAgent: String,
    response: Boolean
});

tokenHitSchema.index({user: 1, token: 1});
tokenHitSchema.index({user: 1, token: 1, date: 1});

/**
 * Before validation of a TokenHit instance, populate some fields.
 */
tokenHitSchema.pre('validate', function (next) {
    if (this.isNew && !this.date) {
        this.date = new Date();
    }
    next();
});

module.exports = mongoose.model('TokenHit', tokenHitSchema);