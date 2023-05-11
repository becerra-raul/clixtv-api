const util = require('util'),
    BaseController = require('./base-controller'),
    rankingService = require('../services/leaderboard-service')


function Controller(app) {
    if (!(this instanceof Controller)) {
        return new Controller(app);
    }
    BaseController.call(this, app, {
        path: '/leaderboard'
    });
}

util.inherits(Controller, BaseController);

Controller.prototype.registerAllMethods = function () {
    this.registerGetMethod('/ranking', this.getRankingResults);
};

Controller.prototype.getRankingResults = function (request, response) {
    this.handleRequest(request, response, async () => {
        const curUser = this.getSessionUser(request);
        if (!request.query.userId) {
            request.query.userId = curUser.id;
        }
        this.validatePayload(request.query, ['userId']);
        const data = await rankingService.getRankingResults(request.query);
        this.sendSuccess(response, data);
    })
};

module.exports = Controller;