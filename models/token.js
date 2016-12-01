'use strict';

/**
 * @file Defines the token model.
 */

const mongoose = require('mongoose');
const uuid = require('uuid');

const TokenHit = require('./tokenHit');
const async = require('async');

/**
 * Token Mongoose schema.
 */
var tokenSchema = mongoose.Schema({
    namespace: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Namespace',
        required: [true, 'token.namespaceRequired']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User',
        required: [true, 'token.userRequired']
    },
    value: {
        type: String,
        required: [true, 'token.valueRequired']
    },
    description: String,
    count: {type: Number, default: 0},
    active: {type: Boolean, default: true},
    startsAt: Date,
    endsAt: Date,
    pool: Number
}, {
    timestamps: {}
});

/**
 * Creates a new tokenHit.
 *
 * @param ip
 * @param userAgent
 * @param response
 * @param callback
 */
tokenSchema.methods.createTokenHit = function (ip, userAgent, response, callback) {
    var tokenHit = new TokenHit({
        token: this._id,
        namespace: this.namespace,
        user: this.user,
        ip: ip,
        userAgent: userAgent,
        response: response
    });
    tokenHit.save(function (err, tokenHit) {
        callback(err, tokenHit);
    });
};

/**
 * Ensures that the token's startsAt property is not after the endsAt one.
 */
tokenSchema.path('startsAt').validate(function (value, done) {
    if (this.endsAt) {
        done(value < this.endsAt);
    } else {
        done(true);
    }
}, 'token.startsAtBeforeEndsAt');

/**
 * Ensures that the token's pool property is superior or equal to 0 if set.
 */
tokenSchema.path('pool').validate(function (value, done) {
    if (value) {
        done(value >= 0);
    } else {
        //here, pool is either undefined, null or 0 thus it's ok
        done(true);
    }
}, 'token.poolZeroOrMore');

/**
 * Before validation of a Token instance, populate some fields.
 */
tokenSchema.pre('validate', function (next) {
    if (this.isNew && !this.value) {
        this.value = uuid.v4();
    }
    next();
});

/**
 * Deletes all token's hits when deleting token.
 */
tokenSchema.pre('remove', function (next) {
    var self = this;
    async.parallel(
        [
            function (callback) {
                TokenHit.remove({'token': self._id}, callback);
            }
        ],
        function (err) {
            next(err);
        });
});

module.exports = mongoose.model('Token', tokenSchema);