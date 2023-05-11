const util = require('util'),
    BaseController = require('./base-controller'),
    albumService = require('../services/album-service')


function Controller(app) {
    if (!(this instanceof Controller)) {
        return new Controller(app);
    }
    BaseController.call(this, app, {
        path: '/albums'
    });
}

util.inherits(Controller, BaseController);

Controller.prototype.registerAllMethods = function() {
    this.registerGetMethod('/mylist', this.mylist);
    this.registerGetMethod('/search', this.search);
    this.registerGetMethod('/:id', this.get);
};

Controller.prototype.mylist = function(request, response) {
    this.handleRequest(request, response, async () => {
        const currentUser = this.getSessionUser(request);
        const query = { ...request.query, loggedInUserId: currentUser.id };
        this.validatePayload(query, ['userId', 'albumType', 'filter', 'start', 'limit']);
        const data = await albumService.search(query);
        this.sendSuccess(response, data);
    })
};

Controller.prototype.search = function (request, response) {
    this.handleRequest(request, response, async () => {
        try {
            const currentUser = this.getSessionUser(request);
            request.query.loggedInUserId = currentUser.id;
        } catch (error) {}
        const query = { ...request.query };
        // this.validatePayload(query, ['start', 'limit']);
        const data = await albumService.search(query);
        this.sendSuccess(response, data);
    })
};

Controller.prototype.get = function (request, response) {
    this.handleRequest(request, response, async () => {
        let curUser = {}
        try {
            curUser = this.getSessionUser(request);
        } catch (error) {}
        const data = await albumService.get({ albumId: request.params.id, userId: curUser.id });
        this.sendSuccess(response, data);
    })
};
module.exports = Controller;