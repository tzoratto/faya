'use strict';

/**
 * @file Defines the token model.
 */

const mongoose = require('mongoose');
const uuid = require('uuid');

const TokenHit = require('./tokenHit');

/**
 * Token Mongoose schema.
 */
var tokenSchema = mongoose.Schema({
    namespace: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Namespace',
        required: [true, 'token.namespaceRequired']
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
 * @param callback
 */
tokenSchema.methods.createTokenHit = function (ip, userAgent, callback) {
    var tokenHit = new TokenHit({
        token: this._id,
        ip: ip,
        userAgent: userAgent
    });
    tokenHit.save(function (err, tokenHit) {
        callback(err, tokenHit);
    });
};

/**
 * Checks if this token belongs to a given user.
 *
 * @param id
 * @param callback
 */
tokenSchema.methods.belongsToUser = function (id, callback) {
    var thisToken = this;
    mongoose.models['Namespace'].findOne({'_id': this.namespace, 'user': id}, function (err, namespace) {
        callback(err, namespace ? true : false, thisToken);
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
    TokenHit.find({'token': this._id}, function (err, tokenHits) {
        if (err) {
            throw err;
        }
        tokenHits.forEach(function (tokenHit) {
            tokenHit.remove();
        });
        next();
    });
});

module.exports = mongoose.model('Token', tokenSchema);