'use strict';

/**
 * @file Defines routes related to namespace's token.
 */

const controllers = require('../../../controllers/token');
const express = require('express');
const router = express.Router({mergeParams: true});

router.get('/', controllers.list);
router.post('/', controllers.create);
router.delete('/:id', controllers.delete);
router.get('/:id', controllers.details);
router.put('/:id', controllers.update);

module.exports = router;
