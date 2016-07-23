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
 * Checks if this token is valid.
 */
tokenSchema.methods.isValid = function () {
    return this.active;
};


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