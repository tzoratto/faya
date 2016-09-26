'use strict';

/**
 * @file Configures Express framework.
 */

const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const i18n = require("i18n");
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

module.exports = function(app, passport, mongoDb) {
    i18n.configure({
        locales: ['en', 'fr'],
        directory: path.join(__dirname, '..', '/resources/locales'),
        objectNotation: true
    });
    
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(express.static(path.join(__dirname, '..', 'public')));
    app.use(i18n.init);

    var sessionConfig = {
        secret: process.env.SESSION_SALT || 'changethissalt',
        cookie: {
            maxAge: 604800000
        },
        resave: false,
        saveUninitialized: true,
        //Persists sessions in MongoDB.
        store: new MongoStore({
            mongooseConnection: mongoDb
        })
    };

    if (app.get('env') === 'production' && process.env.HTTPS_ENABLED === 'true') {
        app.set('trust proxy', 1);
        sessionConfig.cookie.secure = true;
    }

    app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

    app.use(session(sessionConfig));
    app.use(passport.initialize());
    app.use(passport.session());
};