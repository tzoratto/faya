'use strict';

const JsonResponse = require('../models/response/jsonResponse');
const logger = require('winston');

module.exports = function (app, passport) {
    const authUtils = require('../utils/authentication')(passport);
    const isLoggedIn = authUtils.isLoggedIn;

    const authRoutes = require('./auth')(passport);
    const apiKeyRoutes = require('./apiKey')(passport);

    app.use('/auth', authRoutes);
    app.use('/api-key', isLoggedIn, apiKeyRoutes);
    

    app.use(function (req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    app.use(function (err, req, res, next) {
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