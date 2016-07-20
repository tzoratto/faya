'use strict';

/**
 * @file Defines routes related to API key.
 */

const controllers = require('../controllers/apiKey');
const express = require('express');
const router = express.Router();

router.get('/', controllers.list);
router.post('/', controllers.create);
router.delete('/:id', controllers.delete);
router.get('/:id', controllers.details);

module.exports = router;