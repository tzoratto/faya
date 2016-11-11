'use strict';

/**
 * @file Entrypoint of the application.
 */

const express = require('express');
const logger = require('winston');
const mongoose = require("mongoose");
const dbConfig = require("./config/database.js");
const appConfig = require('./config/app');
const i18n = require("i18n");
const passport = require('passport');
const insertSetting = require('./config/setting');

mongoose.Promise = Promise;

const app = express();

module.exports = app;

require('./config/logs')(app);
require('./config/passport')(passport);
require('./config/express')(app, passport);
require('./routes/routes')(app, passport);

connectToDB()
    .on('disconnected', function () {
        logger.error(i18n.__('app.databaseDisconnected'));
    })
    .on('connected', function () {
        logger.info(i18n.__('app.databaseConnected'));
    })
    .once('open', function () {
        insertSetting(function (err) {
            if (err) {
                logger.error(i18n.__('app.settingInsertError', err.message));
                process.exit(1);
            }
            startServer();
        });
    });

/**
 * Opens a connection to MongoDB.
 *
 */
function connectToDB() {
    var mongoDb = mongoose.connect(dbConfig.db, {
        server: {
            reconnectTries: Number.MAX_VALUE,
            reconnectInterval: 1000
        }
    });
    mongoDb.catch(function (err) {
        logger.error(i18n.__('app.databaseError'), err);
        mongoose.connection.close(function () {
            setTimeout(connectToDB, 1000);
        });
    });
    return mongoDb.connection;
}


/**
 * Starts the web server.
 */
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

/**
 * Add a signal listener to exit gently.
 *
 * @param signal - The signal to listen for.
 */
function exitOnSignal(signal) {
    process.on(signal, function () {
        logger.warn(i18n.__('app.serverShutdown', signal));
        process.exit(1);
    });
}
