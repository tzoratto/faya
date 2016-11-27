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
    ip: String,
    date: Date,
    userAgent: String
});

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