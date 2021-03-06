'use strict';

/**
 * @file Routes entrypoint.
 */

const sendResponse = require('../utils/sendResponse');
const logger = require('winston');
const apiRoutes = require('./api/api');
const apiKeyRoutes = require('./apiKey');
const validationErrors = require ('../utils/validationErrors');
const settingRoutes = require('./setting');

module.exports = function (app, passport) {
    const authUtils = require('../utils/authentication')(passport);
    const isLoggedIn = authUtils.isLoggedIn;
    const isLoggedInForApi = authUtils.isLoggedInForApi;

    const authRoutes = require('./auth')(passport);

    app.use('/auth', authRoutes);
    app.use('/api-key', isLoggedIn, apiKeyRoutes);
    app.use('/api', isLoggedInForApi, apiRoutes);
    app.use('/setting', settingRoutes);

    /**
     * Last middleware. Called only if all other middlewares didn't handle the request.
     */
    app.use(function (req, res, next) {
        var err = new Error(res.__('notFound'));
        err.status = 404;
        next(err);
    });

    /**
     * First error handler. Called when an error is raised by a middleware.
     * Checks if there are validation errors.
     */
    app.use(validationErrors(function (err, req, res, next) {
        return sendResponse.failureJSON(res, 400, null, err);
    }));

    /**
     * Last error handler.
     */
    app.use(function (err, req, res, next) {
        var errorCode = err.status || 500;
        logger.error(null, err);
        if (app.get('env') === 'development') {
            sendResponse.errorJSON(res, errorCode, err.message, err);
        } else {
            sendResponse.errorJSON(res, errorCode, err.message);
        }
    });
};