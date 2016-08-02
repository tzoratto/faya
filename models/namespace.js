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
    user: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: String
});

/**
 * Ensures that the pair user/name is unique.
 */
namespaceSchema.index({user: 1, name: 1}, {unique: true});

/**
 * Checks that namespaces's name is unique among the user's other namespaces.
 *
 * This validation is not atomic thus it's not reliable in a concurrent context. However, it provides a validation
 * error message when not in a concurrent context and the unique compound index on user/name ensures the unicity of
 * this pair in a concurrent context.
 */
namespaceSchema.path('name').validate(function (value, done) {
    mongoose.models['Namespace'].count({
        'user': this.user,
        'name': value,
        '_id': {'$ne': this._id}
    }, function (err, count) {
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