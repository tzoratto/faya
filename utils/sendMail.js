'use strict';

const nodemailer = require('nodemailer');
const mailConfig = require('../config/mailer');

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