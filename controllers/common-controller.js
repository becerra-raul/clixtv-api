const util = require('util'),
    BaseController = require('./base-controller'),
    commonService = require('../services/common-service');

function Controller(app) {
    if (!(this instanceof Controller)) {
        return new Controller(app);
    }
    BaseController.call(this, app, {
        path: ''
    });
}

util.inherits(Controller, BaseController);

Controller.prototype.registerAllMethods = function() {
    this.registerGetMethod('/get', this.getURLResponse);
    this.registerGetMethod('/asset/search', this.searchAssets);
};

Controller.prototype.getURLResponse = function(request, response) {
    this.handleRequest(request, response, async () => {
        this.validatePayload(request.query, ['url']);
        const data = await commonService.getURLResponse(request.query.url)
        this.sendSuccess(response, data);
    })
};

Controller.prototype.searchAssets = function(request, response) {
    this.handleRequest(request, response, async () => {
        const currentUser = this.getSessionUser(request);
        request.query.userId = currentUser.id;
        const data = await commonService.getAssets(request.query);
        this.sendSuccess(response, data);
    })
};

module.exports = Controller;