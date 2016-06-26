'use strict';

module.exports = {
    smtpConfig: {
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        secure: process.env.MAIL_TLS,
        auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD
        }
    },
    sender: process.env.MAIL_FROM
};