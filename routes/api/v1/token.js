'use strict';

/**
 * @file Defines routes related to tokens in general.
 */

const controllers = require('../../../controllers/token');
const express = require('express');
const router = express.Router();
const authUtils = require('../../../utils/authentication')();
const isAdmin = authUtils.isAdmin;

router.post('/', controllers.create);
router.get('/', controllers.list);
router.delete('/:id', controllers.delete);
router.get('/count', isAdmin, controllers.count);
router.get('/:id', controllers.details);
router.put('/:id', controllers.update);
router.put('/:id/description', controllers.updateDescription);
router.put('/:id/activation', controllers.updateActive);
router.put('/:id/starting-date', controllers.updateStartsAt);
router.put('/:id/ending-date', controllers.updateEndsAt);
router.put('/:id/pool', controllers.updatePool);

module.exports = router;
