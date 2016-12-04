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

/**
 * Computes hits per month for last 12 months
 *
 * @param req
 * @param res
 * @param next
 */
exports.year = function (req, res, next) {
    if (!mongoose.Types.ObjectId.isValid(req.params.tokenId)) {
        return sendResponse.failureJSON(res, 404, res.__('token.notFound'));
    }

    var twelveMonthsAgo = new Date(),
        currentDate = new Date();
    twelveMonthsAgo.setUTCMonth(twelveMonthsAgo.getUTCMonth() - 11);
    twelveMonthsAgo.setUTCDate(1);
    twelveMonthsAgo.setUTCHours(0,0,0,0);
    var tokenId = new mongoose.Types.ObjectId(req.params.tokenId);

    TokenHit.aggregate([
        {
            $match: {
                date: {$gte: twelveMonthsAgo},
                token: tokenId,
                user: req.user._id
            }
        },
        {
            $project: {
                month: {$month: '$date'}
            }
        },
        {
            $group: {
                _id: '$month',
                count: {$sum: 1}
            }
        }
    ], function (err, results) {
        if (err) {
            return next(err);
        }
        var completeResults = {};
        for (var month = twelveMonthsAgo; month <= currentDate; month.setUTCMonth(month.getUTCMonth() + 1)) {
            completeResults[month.getUTCMonth() + 1] = {month: month.getUTCMonth() + 1, count: 0};
        }
        results.forEach(entry => {
            completeResults[entry._id] = {month: entry._id, count: entry.count};
        });
        completeResults = Object.keys(completeResults).map(function (key) {
            return completeResults[key];
        });
        sendResponse.successJSON(res, 200, completeResults);
    });
};

/**
 * Computes hits per day for last month
 *
 * @param req
 * @param res
 * @param next
 */
exports.month = function (req, res, next) {
    if (!mongoose.Types.ObjectId.isValid(req.params.tokenId)) {
        return sendResponse.failureJSON(res, 404, res.__('token.notFound'));
    }

    var thirtyDaysAgo = new Date(),
        currentDate = new Date();
    thirtyDaysAgo.setUTCMonth(thirtyDaysAgo.getUTCMonth() - 1);
    thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() + 1);
    thirtyDaysAgo.setUTCHours(0,0,0,0);
    var tokenId = new mongoose.Types.ObjectId(req.params.tokenId);

    TokenHit.aggregate([
        {
            $match: {
                date: {$gte: thirtyDaysAgo},
                token: tokenId,
                user: req.user._id
            }
        },
        {
            $project: {
                day: {$dayOfMonth: '$date'}
            }
        },
        {
            $group: {
                _id: '$day',
                count: {$sum: 1}
            }
        }
    ], function (err, results) {
        if (err) {
            return next(err);
        }
        var completeResults = {};
        for (var day = thirtyDaysAgo; day <= currentDate; day.setUTCDate(day.getUTCDate() + 1)) {
            completeResults[day.getUTCDate()] = {day: day.getUTCDate(), count: 0};
        }
        results.forEach(entry => {
            completeResults[entry._id] = {day: entry._id, count: entry.count};
        });
        completeResults = Object.keys(completeResults).map(function (key) {
             return completeResults[key];
        });
        sendResponse.successJSON(res, 200, completeResults);
    });
};

/**
 * Computes hits per hour for last 24 hours
 *
 * @param req
 * @param res
 * @param next
 */
exports.day = function (req, res, next) {
    if (!mongoose.Types.ObjectId.isValid(req.params.tokenId)) {
        return sendResponse.failureJSON(res, 404, res.__('token.notFound'));
    }

    var twentyFourHoursAgo = new Date();
    var currentHour = twentyFourHoursAgo.getUTCHours();
    twentyFourHoursAgo.setUTCHours(twentyFourHoursAgo.getUTCHours() - 23, 0, 0, 0);
    var tokenId = new mongoose.Types.ObjectId(req.params.tokenId);

    TokenHit.aggregate([
        {
            $match: {
                date: {$gte: twentyFourHoursAgo},
                token: tokenId,
                user: req.user._id
            }
        },
        {
            $project: {
                hour: {$hour: '$date'}
            }
        },
        {
            $group: {
                _id: '$hour',
                count: {$sum: 1}
            }
        }
    ], function (err, results) {
        if (err) {
            return next(err);
        }
        var completeResults = [];
        for (var i = 0; i < 24; i++) {
            var hour = (i + currentHour + 1) % 24;
            completeResults[hour] = {hour: hour, count: 0};
        }
        results.forEach(entry => {
            completeResults[entry._id] = {hour: entry._id, count: entry.count};
        });
        sendResponse.successJSON(res, 200, completeResults);
    });
};