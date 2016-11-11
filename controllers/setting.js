'use strict';

/**
 * @file Controller related to the application settings.
 */

const sendResponse = require('../utils/sendResponse');
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
        sendResponse.successJSON(res, 200, {subscriptionEnabled: setting.subscriptionEnabled});
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
            sendResponse.successJSON(res, 200);
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
            sendResponse.errorJSON(res, 500, res.__('setting.notFound'));
        }
    });
}