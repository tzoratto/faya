'use strict';

const mongoose = require('mongoose');

/**
 * Checks if the given error is a validation error.
 *
 * @param callback
 */
module.exports = function(callback) {
  return function (err, req, res, next) {
      var validationErrors = null;
      if (err && err instanceof mongoose.Error.ValidationError) {
          validationErrors = {};
          for (var prop in err.errors) {
              if (err.errors.hasOwnProperty(prop) && err.errors[prop].name !== 'CastError') {
                  validationErrors[prop] = res.__(err.errors[prop].message);
              } else if (err.errors.hasOwnProperty(prop)) {
                  validationErrors[prop] = res.__('misc.castError', prop);
              }
          }
      } else if (err && err.name === 'MongoError' && err.code === 11000) {
          validationErrors = {};
          validationErrors['index'] = res.__('misc.indexViolation');
      }

      if (validationErrors) {
          callback(validationErrors, req, res, next);
      } else {
          next(err);
      }
  }
};
