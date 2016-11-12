/**
 * @file Defines the JsonResponse class.
 */

/**
 * Constructor of the JsonResponse class.
 *
 * @class
 * @classdesc This application always returns an instance of this class.
 */
var jsonResponse = function () {
    this.status = 'success';
    this.message = undefined;
    this.data = undefined;
};

/**
 * Marks the response as successful.
 *
 * @param data
 * @return {jsonResponse}
 */
jsonResponse.prototype.makeSuccess = function(data) {
    this.status = 'success';
    this.data = data || null;
    return this;
};

/**
 * Marks the response as a failure.
 *
 * @param data
 * @param message
 * @return {jsonResponse}
 */
jsonResponse.prototype.makeFailure = function(message, data) {
    this.status = 'fail';
    this.message = message || '';
    this.data = data || undefined;
    return this;
};

/**
 * Marks the response as an error.
 *
 * @param message
 * @param data
 * @return {jsonResponse}
 */
jsonResponse.prototype.makeError = function(message, data) {
    this.status = 'error';
    this.message = message || '';
    this.data = data || undefined;
    return this;
};

/**
 * Builds data for paginated results.
 *
 * @param data
 * @param totalCount
 * @param page
 * @returns {{resultCount: *, totalCount: *, offset: *, result: *}}
 */
exports.buildPaginatedData = function(data, totalCount, page) {
    return {
        resultCount: data.length,
        totalCount: totalCount,
        page: page,
        result : data
    };
};

exports.jsonResponse = jsonResponse;
