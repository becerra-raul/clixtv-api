const util = require('util'),
    BaseController = require('./base-controller'),
    noteService = require('../services/note-service')

function Controller(app) {
    if (!(this instanceof Controller)) {
        return new Controller(app);
    }
    BaseController.call(this, app, {
        path: '/note'
    });
}

util.inherits(Controller, BaseController);

Controller.prototype.registerAllMethods = function() {
    this.registerPostMethod('', this.save);
    this.registerPutMethod('/:id', this.save);
    this.registerGetMethod('', this.search);
    this.registerDeleteMethod('/:id', this.delete);
};

Controller.prototype.save = function(request, response) {
    this.handleRequest(request, response, async () => {
        const currentUser = this.getSessionUser(request);
        const payload = { ...request.body, noteId: request.params.id, userId: currentUser.id };
        this.validatePayload(payload, ['userId', 'notableType', 'notableId', 'comment']);
        const data = await noteService.save(payload);
        this.sendSuccess(response, data);
    })
};

Controller.prototype.search = function(request, response) {
    this.handleRequest(request, response, async () => {
        const currentUser = this.getSessionUser(request);
        const query = { ...request.query, userId: currentUser.id };
        const data = await noteService.search(query);
        this.sendSuccess(response, data);
    })
};

Controller.prototype.delete = function (request, response) {
    this.handleRequest(request, response, async () => {
        const currentUser = this.getSessionUser(request);
        const payload = { noteId: request.params.id, userId: currentUser.id };
        this.validatePayload(payload, ['noteId', 'userId']);
        const result = await noteService.delete(payload);
        this.sendSuccess(response, result);
    })
};

module.exports = Controller;