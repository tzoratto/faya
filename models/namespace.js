'use strict';

/**
 * @file Defines the namespace model.
 */

const mongoose = require('mongoose');
const tokenSchema = require('./token');

/**
 * Namespace Mongoose schema.
 */
var namespaceSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: String,
    tokens: [tokenSchema]
});

/**
 * Creates a new token.
 *
 * @param description
 * @param active
 * @param callback
 */
namespaceSchema.methods.createToken = function (description, active, callback) {
    var token = this.tokens.create({
        description: description,
        active: active
    });
    this.tokens.push(token);
    this.parent().save(function (err) {
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
    var token = this.tokens.id(id);
    if (token) {
        token.remove();
        this.parent().save(callback);
    } else {
        var err = new Error();
        err.status = 404;
        callback(err);
    }
};

/**
 * Ensures that namespaces's name is unique.
 */
namespaceSchema.path('name').validate(function (value, done) {
    mongoose.models['User'].count({'namespaces.name': value, 'namespaces._id': {'$ne': this._id}}, function (err, count) {
        if (err) {
            return done(err);
        }
        done(!count);
    });
}, 'The name must be unique');

module.exports = namespaceSchema;