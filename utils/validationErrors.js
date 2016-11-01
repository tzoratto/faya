'use strict';

const mongoose = require('mongoose');

/**
 * Checks if the given error is a validation error.
 *
 * @param err
 * @param res
 * @return {*} - The object containing the validation errors per field.
 */
module.exports = function (err, res) {
    var validationErrors = null;
    if (err && err instanceof mongoose.Error.ValidationError) {
        validationErrors = {};
        for (var prop in err.errors) {
            if (err.errors.hasOwnProperty(prop)) {
                validationErrors[prop] = res.__(err.errors[prop].message);
            }
        }
    } else if (err && err.name === 'MongoError' && err.code === 11000) {
        validationErrors = {};
        validationErrors['index'] = res.__('misc.indexViolation');
    }

    return validationErrors;
};