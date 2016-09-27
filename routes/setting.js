'use strict';

/**
 * @file Defines routes related to application settings.
 */

const controllers = require('../controllers/setting');
const express = require('express');
const router = express.Router();
const authUtils = require('../utils/authentication')();
const isAdmin = authUtils.isAdmin;
const isLoggedInForApi = authUtils.isLoggedInForApi;

router.get('/subscription', controllers.detailsSubscriptionEnabled);
router.put('/subscription', isLoggedInForApi, isAdmin, controllers.updateSubscriptionEnabled);

module.exports = router;
