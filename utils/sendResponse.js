'use strict';

/**
 * @file Defines helpers to send responses.
 */


const JsonResponse = require('../models/response/jsonResponse');

exports.successJSON = function(res, status, data) {
    return res.status(status).json((new JsonResponse()).makeSuccess(data));
};

exports.successPaginatedJSON = function(res, status, data, totalCount, page) {
    var dataPaginated = JsonResponse.buildPaginatedData(data, totalCount, page);
    return res.status(status).json((new JsonResponse()).makeSuccess(dataPaginated));
};

exports.failureJSON = function(res, status, message, data) {
    return res.status(status).json((new JsonResponse()).makeFailure(message, data));
};

exports.errorJSON = function(res, status, message, data) {
    return res.status(status).json((new JsonResponse()).makeError(message, data));
};