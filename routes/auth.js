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
    router.get('/logout', controllers.logout);
    router.post('/signup', controllers.signup);
    router.get('/signup-validation', controllers.signupValidation);

    return router;
};
