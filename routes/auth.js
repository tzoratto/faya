'use strict';

/**
 * @file Defines routes related to authentication.
 */

const JsonResponse = require('../models/response/jsonResponse');
const express = require('express');
const router = express.Router();

module.exports = function (passport) {
    const authUtils = require('../utils/authentication')(passport);
    const controllers = require('../controllers/auth')(passport);

    router.post('/login', controllers.login);
    router.post('/signup', controllers.signup);
    router.get('/signup-validation', controllers.signupValidation);
    router.post('/password-reset', controllers.passwordReset);
    router.post('/password-reset-validation', controllers.passwordResetValidation);

    return router;
};
