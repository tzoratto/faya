'use strict';

/**
 * @file Defines the namespace model.
 */

const mongoose = require('mongoose');

/**
 * Namespace Mongoose schema.
 */
var namespaceSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: String
});

module.exports = namespaceSchema;