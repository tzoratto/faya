'use strict';

const mongoose = require('mongoose');

module.exports = function (err) {
    var validationErrors = null;
    if (err && err instanceof mongoose.Error.ValidationError) {
        validationErrors = {};
        for (var prop in err.errors) {
            if (err.errors.hasOwnProperty(prop)) {
                validationErrors[prop] = err.errors[prop].message;
            }
        }
    }

    return validationErrors;
};