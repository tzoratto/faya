'use strict';

/**
 * @file v1 API routes.
 */

const express = require('express');
const router = express.Router();
const namespaceV1 = require('./namespace');
const tokenV1 = require('./token');
const tokenHitV1 = require('./tokenHit');
const checkV1 = require('./check');
const userV1 = require('./user');

router.use('/namespace', namespaceV1);
router.use('/token', tokenV1);
router.use('/token/:tokenId/history', tokenHitV1);
router.use('/check', checkV1);
router.use('/user', userV1);

module.exports = router;
