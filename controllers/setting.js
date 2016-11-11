'use strict';

/**
 * @file Controller related to the application settings.
 */

const JsonResponse = require('../models/response/jsonResponse');
const Setting = require('../models/setting');

/**
 * Get the details of the subscriptionEnabled property.
 *
 * @param req
 * @param res
 * @param next
 */
exports.detailsSubscriptionEnabled = function (req, res, next) {
    loadSetting(req, res, next, function (setting) {
        res.status(200).json((new JsonResponse()).makeSuccess({subscriptionEnabled: setting.subscriptionEnabled}));
    });
};

/**
 * Updates the subscriptionEnabled property.
 *
 * @param req
 * @param res
 * @param next
 */
exports.updateSubscriptionEnabled = function (req, res, next) {
    loadSetting(req, res, next, function (setting) {
        setting.subscriptionEnabled = req.body.subscriptionEnabled;
        setting.save(function (err) {
            if (err) {
                return next(err);
            }
            res.status(200).json((new JsonResponse()).makeSuccess());
        });
    });
};

/**
 * Loads the setting and passes it to the given callback.
 *
 * @param req
 * @param res
 * @param next
 * @param callback
 */
function loadSetting(req, res, next, callback) {
    Setting.findOne({}, function (err, setting) {
        if (err) {
            return next(err);
        }
        if (setting) {
            callback(setting);
        } else {
            res.status(500).json((new JsonResponse()).makeError(res.__('setting.notFound')));
        }
    });
}