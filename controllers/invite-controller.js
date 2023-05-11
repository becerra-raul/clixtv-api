const util = require('util'),
    BaseController = require('./base-controller'),
    inviteService = require('../services/invite-service')


function Controller(app) {
    if (!(this instanceof Controller)) {
        return new Controller(app);
    }
    BaseController.call(this, app, {
        path: '/invite'
    });
}

util.inherits(Controller, BaseController);

Controller.prototype.registerAllMethods = function() {
    this.registerPostMethod('/album', this.createAlbumInvite);
    this.registerPostMethod('/gamelevel', this.createGameLevelInvite);
    this.registerPostMethod('/albumContest', this.createContestInvite);
};

Controller.prototype.createAlbumInvite = function (request, response) {
    this.handleRequest(request, response, async () => {
        const currentUser = this.getSessionUser(request);
        const payload = { ...request.body, userId: currentUser.id };
        this.validatePayload(payload, ['albumId', 'userId']);
        const data = await inviteService.createAlbumInvite(payload);
        this.sendSuccess(response, data);
    })
};

Controller.prototype.createGameLevelInvite = function (request, response) {
    this.handleRequest(request, response, async () => {
        const currentUser = this.getSessionUser(request);
        const payload = { ...request.body, userId: currentUser.id };
        this.validatePayload(payload, ['gameLevelId', 'userId']);
        const data = await inviteService.createGameLevelInvite(payload);
        this.sendSuccess(response, data);
    })
};

Controller.prototype.createContestInvite = function (request, response) {
    this.handleRequest(request, response, async () => {
        const currentUser = this.getSessionUser(request);
        const payload = { ...request.body, userId: currentUser.id };
        // this.validatePayload(payload, ['userId']);
        const data = await inviteService.createContestInvite(payload);
        this.sendSuccess(response, data);
    })
};


module.exports = Controller;