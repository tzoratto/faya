'use strict';

/**
 * @file Contains utilities to send emails.
 */

const nodemailer = require('nodemailer');
const mailConfig = require('../config/mailer');

/**
 * Send an email.
 *
 * @param recipient
 * @param subject
 * @param content - Email body as text.
 * @param callback
 */
module.exports = function (recipient, subject, content, callback) {
    var transporter = nodemailer.createTransport(mailConfig.smtpConfig);
    var mailOptions = {
        from: mailConfig.sender,
        to: recipient,
        subject: subject,
        text: content
    };
    transporter.sendMail(mailOptions, callback);
};