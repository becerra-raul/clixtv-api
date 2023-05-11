let util = require('util'),
    BaseController = require('./base-controller'),
    indexService = require('../services/index-service'),
    sirqulService = require('../services/sirqul-service');

function Controller(app) {
    if (!(this instanceof Controller)) {
        return new Controller(app);
    }
    BaseController.call(this, app, {
        path: '/search'
    });
}

util.inherits(Controller, BaseController);

Controller.prototype.registerAllMethods = function() {

    this.registerGetMethod('/', this.getSearchResults);

    this.registerGetMethod('/sirqul', this.getSearchResultsSirqul);
};

Controller.prototype.getSearchResults = async function(request, response) {
    let term = request.query.q,
        filters = {
            types: request.query.types || undefined
        };

    try {
        let data = await indexService.searchData(term, filters);
        this.sendSuccess(response, data);
    } catch (e) {
        console.error(e);
        this.sendServerError(response, {
            error: 'Error searching data'
        })
    }
};

Controller.prototype.getSearchResultsSirqul = async function(request, response) {
    let term = request.query.q,
        offset = parseInt(request.query.offset) || 0,
        limit = parseInt(request.query.limit) || 10;

    try {
        let data = await sirqulService.searchUniversal(term, request.query.types, offset, limit);
        this.sendSuccess(response, data);
    } catch (e) {
        console.error(e);
        this.sendServerError(response, {
            error: 'Error searching data'
        })
    }
};

module.exports = Controller;