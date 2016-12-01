'use strict';

/**
 * @file Controllers related to tokenHits.
 */

const sendResponse = require('../utils/sendResponse');
const mongoose = require('mongoose');
const TokenHit = require('../models/tokenHit');

/**
 * Lists all the token's hits.
 *
 * @param req
 * @param res
 * @param next
 */
exports.list = function (req, res, next) {
    if (!mongoose.Types.ObjectId.isValid(req.params.tokenId)) {
        return sendResponse.failureJSON(res, 404, res.__('token.notFound'));
    }
    var tokenId = req.params.tokenId;
    var limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
    var page = req.query.page ? parseInt(req.query.page, 10) : 1;
    var offset = limit * (page - 1);
    var sort = req.query.sort;
    var criteria = {'user': req.user._id, 'token': tokenId};

    TokenHit.find(criteria)
        .skip(offset)
        .limit(limit)
        .sort(sort)
        .exec(function (err, tokenHits) {
            if (err) {
                return next(err);
            }
            TokenHit.count(criteria, function (err, count) {
                if (err) {
                    return next(err);
                }
                sendResponse.successPaginatedJSON(res, 200, tokenHits, count, page);
            });
        });
};
