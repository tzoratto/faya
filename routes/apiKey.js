'use strict';

const controllers = require('../controllers/apiKey');
const express = require('express');
const router = express.Router();

module.exports = function (passport) {

    router.get('/', controllers.list);
    router.post('/', controllers.create);
    router.delete('/:id', controllers.delete);
    router.get('/:id', controllers.details);

    return router;
};