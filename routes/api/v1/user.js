'use strict';

/**
 * @file Defines routes related to users.
 */

const controllers = require('../../../controllers/user');
const express = require('express');
const router = express.Router();
const authUtils = require('../../../utils/authentication')();
const isAdmin = authUtils.isAdmin;
const isAdminOrIsSubject = authUtils.isAdminOrIsSubject;

router.get('/', isAdmin, controllers.list);
router.get('/:id', isAdminOrIsSubject, controllers.details);
router.delete('/:id', isAdminOrIsSubject, controllers.delete);

module.exports = router;
