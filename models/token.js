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
    namespace: {type: mongoose.Schema.Types.ObjectId, ref: 'Namespace'},
    value: {
        type: String,
        required: true
    },
    description: String,
    count: {type: Number, default: 0},
    active: {type: Boolean, default: true}
}, {
    timestamps: {}
});

/**
 * Before validation of a Token instance, populate some fields.
 */
tokenSchema.pre('validate', function (next) {
    if (this.isNew) {
        this.value = uuid.v4();
    }
    next();
});

module.exports = mongoose.model('Token', tokenSchema);