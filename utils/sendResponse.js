'use strict';

const jsonResponse = require('../models/response/jsonResponse');
const JsonResponse = jsonResponse.jsonResponse;
const buildPaginatedData = jsonResponse.buildPaginatedData;

exports.successJSON = function(res, status, data) {
    return res.status(status).json((new JsonResponse()).makeSuccess(data));
};

exports.successPaginatedJSON = function(res, status, data, totalCount, page) {
    var dataPaginated = buildPaginatedData(data, totalCount, page);
    return res.status(status).json((new JsonResponse()).makeSuccess(dataPaginated));
};

exports.failureJSON = function(res, status, message, data) {
    return res.status(status).json((new JsonResponse()).makeFailure(message, data));
};

exports.errorJSON = function(res, status, message, data) {
    return res.status(status).json((new JsonResponse()).makeError(message, data));
};