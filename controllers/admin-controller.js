let util = require('util'),
    BaseController = require('./base-controller'),
    videoService = require('../services/video-service'),
    indexService = require('../services/index-service');

function Controller(app) {
    if (!(this instanceof Controller)) {
        return new Controller(app);
    }
    BaseController.call(this, app, {
        path: '/admin'
    });
}

util.inherits(Controller, BaseController);

Controller.prototype.registerAllMethods = function() {

    this.registerGetMethod('/videos/id/:id', this.getVideoById);

    this.registerPostMethod('/index', this.indexData);
};

Controller.prototype.getVideoById = async function(request, response) {

    if (request.accessLevels.indexOf('ADMIN') === -1) {
        this.sendForbiddenError(response, {
            error: 'Invalid permissions to access this data'
        });
        return new Promise(() => {});
    }

    try {
        let data = await videoService.getVideoById(request.params.id);
        this.sendSuccess(response, data);
    } catch (e) {
        console.error(JSON.stringify(e, null, 4));
        this.sendServerError(response, {
            error: 'Error getting video'
        })
    }
};

Controller.prototype.indexData = async function(request, response) {

    let type = request.body.type,
        id = request.body.id;

    // if (request.accessLevels.indexOf('ADMIN') === -1) {
    //     this.sendForbiddenError(response, {
    //         error: 'Invalid permissions to index this data'
    //     });
    //     return new Promise(() => {});
    // }

    try {
        let data = await indexService.indexData(type, id);
        this.sendSuccess(response, data);
    } catch (e) {
        console.warn('Error indexing data. Retrying...', e);
        try {
            let data = await indexService.indexData(type, id);
            this.sendSuccess(response, data);
        } catch (e) {
            console.error('Error indexing data.', e);
            this.sendServerError(response, {
                error: 'Error indexing data'
            })
        }
    }
};

module.exports = Controller;