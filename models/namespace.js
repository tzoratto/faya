'use strict';

/**
 * @file Defines the namespace model.
 */

const mongoose = require('mongoose');
const Token = require('./token');

/**
 * Namespace Mongoose schema.
 */
var namespaceSchema = mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    name: {
        type: String,
        required: true
    },
    description: String
});

/**
 * Creates a new token.
 *
 * @param description
 * @param active
 * @param callback
 */
namespaceSchema.methods.createToken = function (description, active, callback) {
    var token = new Token({
        namespace: this._id,
        active: active,
        description: description
    });
    token.save(function (err, token) {
        callback(err, token);
    });
};

/**
 * Deletes a token.
 *
 * @param id
 * @param callback
 */
namespaceSchema.methods.deleteToken = function (id, callback) {
    Token.findOneAndRemove({'namespace': this._id, '_id': id}, function (err, token) {
        if (!err && !token) {
            err = new Error();
            err.status = 404;
        }
        callback(err);
    });
};

/**
 * Ensures that namespaces's name is unique.
 */
namespaceSchema.path('name').validate(function (value, done) {
    mongoose.models['Namespace'].count({'name': value, '_id': {'$ne': this._id}}, function (err, count) {
        if (err) {
            return done(err);
        }
        done(!count);
    });
}, 'The name must be unique');

/**
 * Deletes all namespace's tokens when deleting namespace.
 */
namespaceSchema.pre('remove', function (next) {
    Token.remove({'namespace': this._id}).exec();
    next();
});

module.exports = mongoose.model('Namespace', namespaceSchema);