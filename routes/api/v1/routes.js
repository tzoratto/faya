'use strict';

/**
 * @file v1 API routes.
 */

const express = require('express');
const router = express.Router();
const namespaceV1 = require('./namespace');
const tokenV1 = require('./token');

router.use('/namespace', namespaceV1);
router.use('/namespace/:namespaceId/token', tokenV1);

module.exports = router;
