'use strict';

/**
 * @file Defines routes related to tokens in general.
 */

const controllers = require('../../../controllers/token');
const express = require('express');
const router = express.Router({mergeParams: true});

router.get('/', controllers.list);

module.exports = router;
