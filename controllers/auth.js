'use strict';

const JsonResponse = require('../models/response/jsonResponse');
const appConfig = require('../config/app');
const User = require('../models/user');
const sendMail = require('../utils/sendMail');

var passport;

var login = function (req, res, next) {
    passport.authenticate('local-login', function (err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            res.status(401).json((new JsonResponse()).makeFailure(null, info.message));
        }
        else {
            req.logIn(user, function (err) {
                if (err) {
                    return next(err);
                }
                res.status(200).json((new JsonResponse()).makeSuccess());
            });
        }
    })(req, res, next);
};

var logout = function (req, res) {
    req.logout();
    res.status(200).json((new JsonResponse()).makeSuccess());
};

var signup = function (req, res, next) {
    passport.authenticate('local-signup', function (err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            res.status(500).json((new JsonResponse()).makeFailure(null, info.message));
        }
        else {
            var mailContent = res.__('account.validationLink', appConfig.url + '/auth/signup-validation?email=' + user.local.email + '&token=' + user.local.token);
            sendMail(user.local.email, res.__('account.validationMailSubject'), mailContent, function (err) {
                if (err) {
                    return next(err);
                } else {
                    res.status(200).json((new JsonResponse()).makeSuccess());
                }
            });
        }
    })(req, res, next);
};

var signupValidation = function (req, res, next) {
    var email = req.query.email;
    var token = req.query.token;

    User.findOne({
        'local.email': email,
        'local.token': token
    }, function (err, user) {
        if (err) {
            return next(err);
        }
        if (user) {
            user.local.valid = true;
            user.local.token = undefined;
            user.save(function (err) {
                if (err) {
                    return next(err);
                }
                req.logIn(user, function (err) {
                    if (err) {
                        return next(err);
                    }
                    res.status(200).json((new JsonResponse()).makeSuccess());
                });
            });
        } else {
            res.status(500).json((new JsonResponse()).makeFailure(null, res.__('account.validationInvalid')));
        }
    });
};

var unlinkLocal = function (req, res, next) {
    var user = req.user;
    if (!user.facebook.id && !user.twitter.id && !user.google.id) {
        res.status(500).json((new JsonResponse()).makeFailure(null, res.__('account.unlinkLocalImpossible')));
    } else {
        user.local = undefined;
        user.save(function (err) {
            if (err) {
                return next(err);
            }
            res.status(200).json((new JsonResponse()).makeSuccess());
        });
    }
};

var facebookCallback = function (req, res, next) {
    passport.authenticate('facebook', function (err, user, info) {
        if (err) {
            return next(err);
        }
        if (user) {
            req.logIn(user, function (err) {
                if (err) {
                    return next(err);
                }
                res.status(200).json((new JsonResponse()).makeSuccess());
            });
        } else {
            res.status(500).json((new JsonResponse()).makeFailure(null, info.message));
        }
    })(req, res, next);
};

var unlinkFacebook = function (req, res, next) {
    var user = req.user;
    if (!user.local.email && !user.twitter.id && !user.google.id) {
        res.status(500).json((new JsonResponse()).makeFailure(null, res.__('account.unlinkFacebookImpossible')));
    } else {
        user.facebook = undefined;
        user.save(function (err) {
            if (err) {
                return next(err);
            }
            res.status(200).json((new JsonResponse()).makeSuccess());
        });
    }
};

var twitterCallback = function (req, res, next) {
    passport.authenticate('twitter', function (err, user, info) {
        if (err) {
            return next(err);
        }
        if (user) {
            req.logIn(user, function (err) {
                if (err) {
                    return next(err);
                }
                res.status(200).json((new JsonResponse()).makeSuccess());
            });
        } else {
            res.status(500).json((new JsonResponse()).makeFailure(null, info.message));
        }
    })(req, res, next);
};

var unlinkTwitter = function (req, res, next) {
    var user = req.user;
    if (!user.local.email && !user.facebook.id && !user.google.id) {
        res.status(500).json((new JsonResponse()).makeFailure(null, res.__('account.unlinkTwitterImpossible')));
    } else {
        user.twitter = undefined;
        user.save(function (err) {
            if (err) {
                return next(err);
            }
            res.status(200).json((new JsonResponse()).makeSuccess());
        });
    }
};

var googleCallback = function (req, res, next) {
    passport.authenticate('google', function (err, user, info) {
        if (err) {
            return next(err);
        }
        if (user) {
            req.logIn(user, function (err) {
                if (err) {
                    return next(err);
                }
                res.status(200).json((new JsonResponse()).makeSuccess());
            });
        } else {
            res.status(500).json((new JsonResponse()).makeFailure(null, info.message));
        }
    })(req, res, next);
};

var unlinkGoogle = function (req, res, next) {
    var user = req.user;
    if (!user.local.email && !user.twitter.id && !user.facebook.id) {
        res.status(500).json((new JsonResponse()).makeFailure(null, res.__('account.unlinkGoogleImpossible')));
    } else {
        user.google = undefined;
        user.save(function (err) {
            if (err) {
                return next(err);
            }
            res.status(200).json((new JsonResponse()).makeSuccess());
        });
    }
};

module.exports = function (passportInstance) {
    var controllers = {};

    passport = passportInstance;

    controllers.login = login;
    controllers.logout = logout;
    controllers.signup = signup;
    controllers.signupValidation = signupValidation;
    controllers.unlinkLocal = unlinkLocal;
    controllers.facebookCallback = facebookCallback;
    controllers.unlinkFacebook = unlinkFacebook;
    controllers.twitterCallback = twitterCallback;
    controllers.unlinkTwitter = unlinkTwitter;
    controllers.googleCallback = googleCallback;
    controllers.unlinkGoogle = unlinkGoogle;

    return controllers;
};
