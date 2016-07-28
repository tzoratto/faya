'use strict';

/**
 * @file Defines the token model.
 */

const mongoose = require('mongoose');
const uuid = require('uuid');

/**
 * Token Mongoose schema.
 */
var tokenSchema = mongoose.Schema({
    namespace: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Namespace',
        required: true
    },
    value: {
        type: String,
        required: true
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
}, 'The startsAt property must be before the endsAt one');

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
}, 'The pool property must be superior or equal to 0');

/**
 * Before validation of a Token instance, populate some fields.
 */
tokenSchema.pre('validate', function (next) {
    if (this.isNew && !this.value) {
        this.value = uuid.v4();
    }
    next();
});

module.exports = mongoose.model('Token', tokenSchema);