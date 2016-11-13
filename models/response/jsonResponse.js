'use strict';

/**
 * @file Defines the JsonResponse class.
 */


/**
 * JsonResponse class
 *
 * The API should respond with an instance of this class.
 *
 */
class JsonResponse {
    constructor () {
        this.status = 'success';
        this.message = undefined;
        this.data = undefined;
    }

    makeSuccess (data) {
        this.status = 'success';
        this.data = data || null;
        return this;
    }

    makeFailure (message, data) {
        this.status = 'fail';
        this.message = message || '';
        this.data = data || undefined;
        return this;
    }

    makeError (message, data) {
        this.status = 'error';
        this.message = message || '';
        this.data = data || undefined;
        return this;
    }

    static buildPaginatedData(data, totalCount, page) {
        return {
            resultCount: data.length,
            totalCount: totalCount,
            page: page,
            result : data
        };
    }
}

module.exports = JsonResponse;
