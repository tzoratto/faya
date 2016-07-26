'use strict';

/**
 * @file Routes entrypoint.
 */

const JsonResponse = require('../models/response/jsonResponse');
const logger = require('winston');
const apiRoutes = require('./api/api');
const apiKeyRoutes = require('./apiKey');
const validationErrors = require ('../utils/validationErrors');

module.exports = function (app, passport) {
    const authUtils = require('../utils/authentication')(passport);
    const isLoggedIn = authUtils.isLoggedIn;
    const isLoggedInForApi = authUtils.isLoggedInForApi;

    const authRoutes = require('./auth')(passport);

    app.use('/auth', authRoutes);
    app.use('/api-key', isLoggedIn, apiKeyRoutes);
    app.use('/api', isLoggedInForApi, apiRoutes);

    /**
     * Last middleware. Called only if all other middlewares didn't handle the request.
     */
    app.use(function (req, res, next) {
        var err = new Error(res.__('notFound'));
        err.status = 404;
        next(err);
    });

    /**
     * Error handling. Called when an error is raised by a middleware.
     */
    app.use(function (err, req, res, next) {
        //Checks if this is a validation error.
        var valErrors = validationErrors(err);
        if (valErrors) {
            res.status(400).json((new JsonResponse()).makeFailure(valErrors));
            return;
        }

        var errorCode = err.status || 500;
        res.status(errorCode);
        logger.error(null, err);
        if (app.get('env') === 'development') {
            res.json((new JsonResponse()).makeError(err.message, err));
        } else {
            res.json((new JsonResponse()).makeError(err.message));
        }
    });
};