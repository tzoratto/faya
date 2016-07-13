'use strict';

const morgan = require('morgan');
const logger = require('winston');

module.exports = function(app) {
    var log = 'dev';
    if (app.get('env') !== 'development') {
        log = {
            stream: {
                write: function(message) {
                    logger.info(message);
                }
            }
        };
    }

    logger.remove(logger.transports.Console);
    logger.add(logger.transports.Console, {'timestamp': true});
    logger.level = process.env.LOG_LEVEL || 'info';

    if (app.get('env') !== 'test') {
        app.use(morgan('combined', log));
    }
};