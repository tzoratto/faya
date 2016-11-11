'use strict';

/**
 * @file Configures Express framework.
 */

const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const i18n = require("i18n");
const cors = require('cors');

module.exports = function(app, passport) {
    i18n.configure({
        locales: ['en', 'fr'],
        directory: path.join(__dirname, '..', '/resources/locales'),
        objectNotation: true
    });
    
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(i18n.init);

    if (app.get('env') === 'production' && process.env.HTTPS_ENABLED === 'true') {
        app.set('trust proxy', 1);
    }

    app.use(cors());

    app.use(passport.initialize());
};