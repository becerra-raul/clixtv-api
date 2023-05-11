const util = require('util'),
    BaseController = require('./base-controller'),
    likeService = require('../services/like-service')


function Controller(app) {
    if (!(this instanceof Controller)) {
        return new Controller(app);
    }
    BaseController.call(this, app, {
        path: '/likes'
    });
}

util.inherits(Controller, BaseController);

Controller.prototype.registerAllMethods = function() {
    this.registerPostMethod('/', this.add);
    this.registerDeleteMethod('/', this.remove);
};

Controller.prototype.add = function(request, response) {
    this.handleRequest(request, response, async () => {
        const currentUser = this.getSessionUser(request);
        const payload = { ...request.body, userId: currentUser.id };
        this.validatePayload(payload, ['userId', 'likableId']);
        const data = await likeService.add(payload);
        this.sendSuccess(response, data);
    })
};

Controller.prototype.remove = function(request, response) {
    this.handleRequest(request, response, async () => {
        const currentUser = this.getSessionUser(request);
        const payload = { ...request.body, userId: currentUser.id };
        this.validatePayload(payload, ['userId', 'likableId']);
        const data = await likeService.remove(payload);
        this.sendSuccess(response, data);
    })
};

module.exports = Controller;