'use strict';

const mongoose = require('mongoose');
const async = require('async');

/**
 * Inserts the documents from the given dataSet.
 *
 * @param dataSet
 * @param callback
 */
module.exports = function (dataSet, callback) {
    async.forEachOf(dataSet, function (value, key, callback) {
        mongoose.models[key].remove({}, function (err) {
            if (err) {
                return callback(err);
            }
            if (dataSet[key].length > 0) {
                mongoose.models[key].insertMany(dataSet[key], function (err) {
                    if (err) {
                        return callback(err);
                    }
                    return callback(null);
                });
            } else {
                return callback(null);
            }
        });
    }, function (err) {
        if (err) {
            throw err;
        }
        callback();
    });
};