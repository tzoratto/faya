'use strict';

/**
 * @file Defines routes related to tokenHits in general.
 */

const controllers = require('../../../controllers/tokenHit');
const express = require('express');
const router = express.Router({mergeParams: true});

router.get('/', controllers.list);

module.exports = router;
