const util = require('util'),
    BaseController = require('./base-controller'),
    ratingService = require('../services/rating-service')

function Controller(app) {
    if (!(this instanceof Controller)) {
        return new Controller(app);
    }
    BaseController.call(this, app, {
        path: '/rating'
    });
}

util.inherits(Controller, BaseController);

Controller.prototype.registerAllMethods = function() {
    this.registerPostMethod('', this.saveRating);
    this.registerPutMethod('/:id', this.saveRating);
};

Controller.prototype.saveRating = function(request, response) {
    this.handleRequest(request, response, async () => {
        const currentUser = this.getSessionUser(request);
        const payload = { ...request.body, ratingId: request.params.id, userId: currentUser.id };
        this.validatePayload(payload, ['userId', 'ratableType', 'ratableId', 'ratingValue']);
        const data = await ratingService.saveRating(payload);
        this.sendSuccess(response, data);
    })
};

module.exports = Controller;