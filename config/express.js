'use strict';

const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const i18n = require("i18n");

module.exports = function(app) {
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(i18n.init);
};