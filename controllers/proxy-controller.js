let util = require('util'),
    BaseController = require('./base-controller'),
    proxyService = require('../services/proxy-service');

function Controller(app) {
    if (!(this instanceof Controller)) {
        return new Controller(app);
    }
    BaseController.call(this, app, {
        path: '/'
    });
}

util.inherits(Controller, BaseController);

Controller.prototype.registerAllMethods = function() {
    this.registerGetMethod('*', this.getProxyRequest);
};

Controller.prototype.getProxyRequest = async function(request, response) {
    try {
        this.sendSuccess(response, await proxyService.getProxyRequest(request.url))
    } catch (e) {
        console.error(JSON.stringify(e, null, 4));
        this.sendServerError(response, {
            error: 'Error getting data'
        })
    }
};

module.exports = Controller;