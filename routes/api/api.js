'use strict';

/**
 * @file API routes entrypoint.
 */

const express = require('express');
const router = express.Router();
const namespaceV1 = require('./v1/namespace');

router.use('/namespace', namespaceV1);
router.use('/v1/namespace', namespaceV1);

module.exports = router;
