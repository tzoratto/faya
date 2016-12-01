'use strict';

/**
 * @file Defines routes related to tokens in general.
 */

const controllers = require('../../../controllers/token');
const express = require('express');
const router = express.Router();
const authUtils = require('../../../utils/authentication')();
const isAdminOrIsSubject = authUtils.isAdminOrIsSubject;

router.post('/', controllers.create);
router.get('/', controllers.list);
router.delete('/:id', controllers.delete);
router.get('/count', isAdminOrIsSubject, controllers.count);
router.get('/:id', controllers.details);
router.put('/:id', controllers.update);

module.exports = router;
