let util = require('util'),
    BaseController = require('./base-controller'),
    analyticsService = require('../services/analytics-service'),
    AnalyticsSendGridUsersRequestModel = require('../models/request/analytics-sendgrid-users-request-model');

function Controller(app) {
    if (!(this instanceof Controller)) {
        return new Controller(app);
    }
    BaseController.call(this, app, {
        path: '/analytics'
    });
}

util.inherits(Controller, BaseController);

Controller.prototype.registerAllMethods = function() {

    /**
     * @api {post} /analytics/sendgrid/users Get SendGrid users
     * @apiName PostAnalyticsSendGridUsers
     * @apiGroup Analytics
     * @apiVersion 2.0.0
     *
     * @apiDescription Returns a list of SendGrid users matching the provided search conditions. This data requires elevated permissions, and must provide a valid authorization token header.
     *
     * @apiParam {String} created The date a user was added to the system in MM/DD/YYYY format. Can be a single date (Ex. "06/15/2017") or a range (Ex. "06/10/2017-06/12/2017").
     *
     * @apiExample {js} Example usage:
     *                  {
     *                      created: "06/15/2017"
     *                  }
     *
     * @apiSuccess {Object[]} users List of SendGrid users
     *
     * @apiError {String} error Error message if the request was unsuccessful
     */
    this.registerPostMethod('/sendgrid/users', this.getSendGridUsers);
};

Controller.prototype.getSendGridUsers = async function(request, response) {

    if (request.accessLevels.indexOf('ANALYTICS') === -1) {
        this.sendForbiddenError(response, {
            error: 'Invalid permissions to access this data'
        });
        return new Promise(() => {});
    }

    let model = new AnalyticsSendGridUsersRequestModel(request.body);

    try {
        let data = await analyticsService.searchSendGridUsers(model.conditions);
        this.sendSuccess(response, data);
    } catch (e) {
        console.error(JSON.stringify(e, null, 4));
        this.sendServerError(response, {
            error: 'Error searching users'
        })
    }
};

module.exports = Controller;