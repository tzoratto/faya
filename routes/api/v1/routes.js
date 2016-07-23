'use strict';

/**
 * @file v1 API routes.
 */

const express = require('express');
const router = express.Router();
const namespaceV1 = require('./namespace');
const namespaceTokenV1 = require('./namespaceToken');
const tokenV1 = require('./token');
const checkV1 = require('./check');

router.use('/namespace', namespaceV1);
router.use('/namespace/:namespaceId/token', namespaceTokenV1);
router.use('/token', tokenV1);
router.use('/check', checkV1);

module.exports = router;
