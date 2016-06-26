'use strict';

const JsonResponse = require('../models/response/jsonResponse');
const express = require('express');
const router = express.Router();

module.exports = function (passport) {
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

    router.get('/profile', isLoggedIn, function (req, res) {
        res.status(200).json((new JsonResponse()).makeSuccess());
    });

    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        res.status(403).json((new JsonResponse()).makeFailure());
    }

    function isLoggedOff(req, res, next) {
        if (req.isAuthenticated()) {
            res.status(403).json((new JsonResponse()).makeFailure());
        } else {
            return next();
        }
    }

    return router;
};
