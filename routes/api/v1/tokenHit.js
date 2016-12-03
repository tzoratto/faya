'use strict';

/**
 * @file Defines routes related to tokenHits in general.
 */

const controllers = require('../../../controllers/tokenHit');
const express = require('express');
const router = express.Router({mergeParams: true});

router.get('/', controllers.list);
router.get('/year', controllers.year);
router.get('/month', controllers.month);
router.get('/day', controllers.day);

module.exports = router;
