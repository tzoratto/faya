'use strict';

/**
 * @file Defines routes related to application settings.
 */

const controllers = require('../controllers/setting');
const express = require('express');
const router = express.Router();
const authUtils = require('../utils/authentication')();
const isLoggedInAsAnAdmin = authUtils.isLoggedInAsAnAdmin;
const isLoggedInForApi = authUtils.isLoggedInForApi;

router.get('/subscription', controllers.detailsSubscriptionEnabled);
router.put('/subscription', isLoggedInForApi, isLoggedInAsAnAdmin, controllers.updateSubscriptionEnabled);
router.get('/authentication', controllers.detailsAuthMethods);

module.exports = router;
