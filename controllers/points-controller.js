let util = require('util'),
    BaseController = require('./base-controller'),
    pointsService = require('../services/points-service'),
    PointsAddRequestModel = require('../models/request/points-add-request-model'),
    DuplicateEntryErrorModel = require('../models/duplicate-entry-error-model'),
    InvalidRequestErrorModel = require('../models/invalid-request-error-model');

function Controller(app) {
    if (!(this instanceof Controller)) {
        return new Controller(app);
    }
    BaseController.call(this, app, {
        path: '/points'
    });
}

util.inherits(Controller, BaseController);

Controller.prototype.registerAllMethods = function() {
    this.registerGetMethod('/user/id/:userid', this.getPointsForUser);
    this.registerPostMethod('/', this.addPoints);
};

Controller.prototype.getPointsForUser = async function(request, response) {
    let userId = request.params.userid;
    try {
        let data = await pointsService.getPointsForUser(userId);
        this.sendSuccess(response, data);
    } catch (e) {
        console.error(e);
        this.sendServerError(response, {
            error: 'Error getting points for user'
        })
    }
};

Controller.prototype.addPoints = async function(request, response) {
    let requestModel = new PointsAddRequestModel(request.body);

    try {
        let data = await pointsService.addPoints(requestModel.userId, requestModel.type, requestModel.entityId);
        this.sendSuccess(response, data);
    } catch (e) {
        console.error(e);
        if ((e instanceof DuplicateEntryErrorModel) || (e instanceof InvalidRequestErrorModel)) {
            this.sendBadRequestError(response, {
                error: e.message
            });
        } else {
            this.sendServerError(response, {
                error: 'Error adding points'
            });
        }
    }
};

module.exports = Controller;