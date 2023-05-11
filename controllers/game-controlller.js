const util = require('util'),
    BaseController = require('./base-controller'),
    gameService = require('../services/game-service')


function Controller(app) {
    if (!(this instanceof Controller)) {
        return new Controller(app);
    }
    BaseController.call(this, app, {
        path: '/games'
    });
}

util.inherits(Controller, BaseController);

Controller.prototype.registerAllMethods = function () {
    this.registerGetMethod('/pack/search', this.packSearch);
    this.registerGetMethod('/pack/:id', this.getPack);
    this.registerPostMethod('/score/create', this.createScore);
    this.registerGetMethod('/ticket/count', this.getTicketCount);
    this.registerGetMethod('/:gameObjectId/hint', this.getGameHint);
};


Controller.prototype.packSearch = function (request, response) {
    this.handleRequest(request, response, async () => {
        try {
            const currentUser = this.getSessionUser(request);
            request.query.userId = currentUser.id;
        } catch (error) { }
        const query = { ...request.query };
        const data = await gameService.packSearch(query);
        this.sendSuccess(response, data);
    })
};

Controller.prototype.getPack = function (request, response) {
    this.handleRequest(request, response, async () => {
        try {
            const currentUser = this.getSessionUser(request);
            request.query.userId = currentUser.id;
        } catch (error) { }
        const query = { ...request.query, packId: request.params.id };
        const data = await gameService.getPack(query);
        this.sendSuccess(response, data);
    })
};

Controller.prototype.createScore = function (request, response) {
    this.handleRequest(request, response, async () => {
        try {
            const currentUser = this.getSessionUser(request);
            request.body.userId = currentUser.id;
        } catch (error) { }
        const body = { ...request.body };
        const data = await gameService.createScore(body);
        this.sendSuccess(response, data);
    })
};

Controller.prototype.getTicketCount = function (request, response) {
    this.handleRequest(request, response, async () => {
        try {
            const currentUser = this.getSessionUser(request);
            request.query.userId = currentUser.id;
        } catch (error) { }
        const query = { ...request.query };
        const data = await gameService.getTicketCount(query);
        this.sendSuccess(response, data);
    })
};

Controller.prototype.getGameHint = function (request, response) {
    this.handleRequest(request, response, async () => {
        const payload = { objectId: request.params.gameObjectId };
        const currentUser = this.getSessionUser(request);
        payload.userId = currentUser.id;
        const data = await gameService.getGameHint(payload);
        this.sendSuccess(response, data);
    })
};

module.exports = Controller;