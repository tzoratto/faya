'use strict';

/**
 * @file Defines routes related to token checking.
 */

const controllers = require('../../../controllers/check');
const express = require('express');
const router = express.Router();

router.get('/', controllers.check);

module.exports = router;
