'use strict';

const JsonResponse = require('../models/response/jsonResponse');

module.exports = function (app) {
    app.get('/test', function (req, res, next) {
        res.status(200).json((new JsonResponse()).makeSuccess('tada'));
    });

    app.use(function (req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    app.use(function (err, req, res, next) {
        var errorCode = err.status || 500;
        res.status(errorCode);
        if (app.get('env') === 'development') {
            res.json(new JsonResponse().makeError(err.message, err));
        } else {
            res.json(new JsonResponse().makeError(err.message));
        }
    });
};