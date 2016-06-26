'use strict';

const express = require('express');
const logger = require('winston');
const mongoose = require("mongoose");
const dbConfig = require("./config/database.js");
const appConfig = require('./config/app');
const i18n = require("i18n");

const app = express();

module.exports = app;

i18n.configure({
    locales: ['en', 'fr'],
    directory: __dirname + '/resources/locales',
    objectNotation: true
});

var mongoDb = connectToDB();

require('./config/logs')(app);
require('./config/express')(app);
require('./routes/routes')(app);

mongoDb
    .on('error', function(err) {
        logger.error(i18n.__('app.databaseError'), err);
    })
    .on('disconnected', connectToDB)
    .once('open', function () {
        logger.info(i18n.__('app.databaseConnected'));
        startServer();
    });

function connectToDB() {
    return mongoose.connect(dbConfig.db).connection;
}

function startServer() {
    app.listen(appConfig.port)
    .on('error', function(err) {
        logger.error(i18n.__('app.serverError'), err);
    })
    .on('listening', function() {
        logger.info(i18n.__('app.serverStarted', appConfig.port));
    });
}
