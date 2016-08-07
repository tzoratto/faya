'use strict';

/**
 * @file Defines routes related to authentication.
 */

const JsonResponse = require('../models/response/jsonResponse');
const express = require('express');
const router = express.Router();

module.exports = function (passport) {
    const authUtils = require('../utils/authentication')(passport);
    const isLoggedIn = authUtils.isLoggedIn;
    const isLoggedOff = authUtils.isLoggedOff;
    const controllers = require('../controllers/auth')(passport);

    router.post('/login', isLoggedOff, controllers.login);
    router.get('/logout', controllers.logout);
    router.post('/signup', controllers.signup);
    router.get('/signup-validation', controllers.signupValidation);
    router.get('/facebook', passport.authenticate('facebook', {scope: 'email'}));
    router.get('/twitter', passport.authenticate('twitter'));
    router.get('/google', passport.authenticate('google', {scope: ['profile', 'email']}));
    router.get('/facebook/callback', controllers.facebookCallback);
    router.get('/twitter/callback', controllers.twitterCallback);
    router.get('/google/callback', controllers.googleCallback);
    router.get('/unlink/local', isLoggedIn, controllers.unlinkLocal);
    router.get('/unlink/facebook', isLoggedIn, controllers.unlinkFacebook);
    router.get('/unlink/twitter', isLoggedIn, controllers.unlinkTwitter);
    router.get('/unlink/google', isLoggedIn, controllers.unlinkGoogle);

    return router;
};
