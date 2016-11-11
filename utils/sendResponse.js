'use strict';

const JsonResponse = require('../models/response/jsonResponse');

exports.successJSON = function(res, status, data) {
    return res.status(status).json((new JsonResponse()).makeSuccess(data));
};

exports.failureJSON = function(res, status, message, data) {
    return res.status(status).json((new JsonResponse()).makeFailure(message, data));
};

exports.errorJSON = function(res, status, message, data) {
    return res.status(status).json((new JsonResponse()).makeError(message, data));
};