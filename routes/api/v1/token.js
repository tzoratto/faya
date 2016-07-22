'use strict';

/**
 * @file Defines routes related to tokens in general.
 */

const controllers = require('../../../controllers/token');
const express = require('express');
const router = express.Router();

router.get('/', controllers.list);
router.delete('/:id', controllers.delete);
router.get('/:id', controllers.details);
router.put('/:id', controllers.update);

module.exports = router;
