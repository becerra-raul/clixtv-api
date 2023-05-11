const util = require('util'),
    BaseController = require('./base-controller'),
    tokenService = require('../services/token-service')


function Controller(app) {
    if (!(this instanceof Controller)) {
        return new Controller(app);
    }
    BaseController.call(this, app, {
        path: '/tokens'
    });
}

util.inherits(Controller, BaseController);

Controller.prototype.registerAllMethods = function () {
    this.registerPostMethod('', this.createToken);
    this.registerPostMethod('/verify', this.verifyToken);
    this.registerPutMethod('/:id/resend', this.resendToken);
    this.registerGetMethod('', this.searchTokens);
};

Controller.prototype.createToken = function (request, response) {
    this.handleRequest(request, response, async () => {
        const data = await tokenService.createToken(request.body);
        this.sendSuccess(response, data);
    })
};

Controller.prototype.verifyToken = function (request, response) {
    this.handleRequest(request, response, async () => {
        const data = await tokenService.verifyToken(request.body);
        this.sendSuccess(response, data);
    })
};

Controller.prototype.resendToken = function (request, response) {
    this.handleRequest(request, response, async () => {
        request.body.tokenId = request.params.id;
        const data = await tokenService.resendToken(request.body);
        this.sendSuccess(response, data);
    })
};

Controller.prototype.searchTokens = function (request, response) {
    this.handleRequest(request, response, async () => {
        const data = await tokenService.searchTokens(request.query);
        this.sendSuccess(response, data);
    })
};


module.exports = Controller;