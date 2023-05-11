const util = require('util'),
    BaseController = require('./base-controller'),
    consumerService = require('../services/consumer-service'),
    leaderboardService = require('../services/leaderboard-service')

function Controller(app) {
    if (!(this instanceof Controller)) {
        return new Controller(app);
    }
    BaseController.call(this, app, {
        path: '/consumer'
    });
}

util.inherits(Controller, BaseController);

Controller.prototype.registerAllMethods = function () {
    this.registerGetMethod('/connections', this.getConnections);
    this.registerPutMethod('/friend/status', this.updateFriendStatus);
    this.registerPutMethod('/follow/status', this.updateFollowStatus);
    this.registerGetMethod('/profile', this.getConsumerProfile);
    this.registerPostMethod('/album', this.addConsumerAlbum);
    this.registerPutMethod('/album/:id', this.updateConsumerAlbum);
    this.registerDeleteMethod('/album/:id', this.removeConsumerAlbum);
    this.registerGetMethod('/album/:id', this.getConsumerAlbum);
};


Controller.prototype.getConnections = function (request, response) {
    this.handleRequest(request, response, async () => {
        this.getSessionUser(request);
        const data = await consumerService.getConnections(request.query);
        this.sendSuccess(response, data);
    });
}

Controller.prototype.updateFriendStatus = function (request, response) {
    this.handleRequest(request, response, async () => {
        const currentUser = this.getSessionUser(request);
        const payload = { ...request.body, userId: currentUser.id };
        this.validatePayload(payload, ['friendAccountId', 'status', 'userId']);
        const result = await consumerService.updateFriendStatus(payload);
        this.sendSuccess(response, result);
    })
};

Controller.prototype.updateFollowStatus = function (request, response) {
    this.handleRequest(request, response, async () => {
        const currentUser = this.getSessionUser(request);
        const payload = { ...request.body, userId: currentUser.id };
        this.validatePayload(payload, ['connectionAccountId', 'isFollowing', 'userId']);
        const result = await consumerService.updateFollowStatus(payload);
        this.sendSuccess(response, result);
    })
};

Controller.prototype.getConsumerProfile = async function (request, response) {
    this.handleRequest(request, response, async () => {
        const currentUser = this.getSessionUser(request);
        const query = { ...request.query, userId: currentUser.id };
        this.validatePayload(query, ['userId', 'consumerAccountId']);
        const results = await Promise.all([
            consumerService.getConsumerProfile(query),
            leaderboardService.getRankingResults({ userId: query.consumerAccountId, limit: 1 })
        ]);
        const consumer = results[0];
        consumer.rank = results[1].data && results[1].data.userRank && results[1].data.userRank.rank;
        this.sendSuccess(response, consumer);
    });
};

Controller.prototype.getConsumerAlbum = async function (request, response) {
    this.handleRequest(request, response, async () => {
        const currentUser = this.getSessionUser(request);
        const query = { ...request.query, albumId: request.params.id, userId: currentUser.id };
        this.validatePayload(query, ['userId', 'albumId']);
        const album = await consumerService.getConsumerAlbum(query);
        this.sendSuccess(response, album);
    })
}

Controller.prototype.addConsumerAlbum = function (request, response) {
    this.handleRequest(request, response, async () => {
        const currentUser = this.getSessionUser(request);
        const payload = { ...request.body, userId: currentUser.id };
        this.validatePayload(payload, ['albumType', 'title', 'metaData', 'userId']);
        const result = await consumerService.saveConsumerAlbum(payload);
        this.sendSuccess(response, result);
    })
};

Controller.prototype.updateConsumerAlbum = function (request, response) {
    this.handleRequest(request, response, async () => {
        const currentUser = this.getSessionUser(request);
        const payload = { ...request.body, albumId: request.params.id, userId: currentUser.id };
        this.validatePayload(payload, ['albumId', 'userId']);
        const result = await consumerService.saveConsumerAlbum(payload);
        this.sendSuccess(response, result);
    })
};

Controller.prototype.removeConsumerAlbum = function (request, response) {
    this.handleRequest(request, response, async () => {
        const currentUser = this.getSessionUser(request);
        const payload = { albumId: request.params.id, userId: currentUser.id };
        this.validatePayload(payload, ['albumId', 'userId']);
        const result = await consumerService.removeConsumerAlbum(payload);
        this.sendSuccess(response, result);
    })
};

module.exports = Controller;