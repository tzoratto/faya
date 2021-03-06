'use strict';

/**
 * @file Defines routes related to namespaces.
 */

const controllers = require('../../../controllers/namespace');
const express = require('express');
const router = express.Router();
const authUtils = require('../../../utils/authentication')();
const isAdminOrIsSubject = authUtils.isAdminOrIsSubject;

router.get('/', controllers.list);
router.post('/', controllers.create);
router.delete('/:id', controllers.delete);
router.get('/count', isAdminOrIsSubject, controllers.count);
router.get('/:id', controllers.details);
router.put('/:id', controllers.update);

module.exports = router;
