'use strict';

const express = require('express');
const logger = require('winston');
const mongoose = require("mongoose");
const dbConfig = require("./config/database.js");
const appConfig = require('./config/app');
const i18n = require("i18n");
const passport = require('passport');

const app = express();

module.exports = app;

mongoose.Promise = global.Promise;
var mongoDb = connectToDB();

require('./config/logs')(app);
require('./config/passport')(passport);
require('./config/express')(app, passport, mongoDb);
require('./routes/routes')(app, passport);

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

exitOnSignal('SIGINT');
exitOnSignal('SIGTERM');

function exitOnSignal(signal) {
    process.on(signal, function () {
        logger.warn(i18n.__('app.serverShutdown', signal));
        process.exit(1);
    });
}
