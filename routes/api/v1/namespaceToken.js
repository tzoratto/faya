'use strict';

/**
 * @file Defines routes related to namespace's token.
 */

const controllers = require('../../../controllers/token');
const express = require('express');
const router = express.Router({mergeParams: true});

router.get('/', controllers.list);
router.post('/', controllers.create);

module.exports = router;
