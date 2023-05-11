let util = require('util'),
    BaseController = require('./base-controller'),
    mediaService = require('../services/media-service'),
    InvalidRequestErrorModel = require('../models/invalid-request-error-model'),
    NotFoundErrorModel = require('../models/not-found-error-model'),
    MediaRequestModel = require('../models/request/media-request-model'),
    TransformableMediaRequestModel = require('../models/request/transformable-media-request-model');

function Controller(app) {
    if (!(this instanceof Controller)) {
        return new Controller(app);
    }
    BaseController.call(this, app, {
        path: '/media'
    });
}

util.inherits(Controller, BaseController);

Controller.prototype.registerAllMethods = function() {

    this.registerGetMethod('/', this.getMedia);

    /**
     * @api {get} /media/image Get transformable image
     * @apiName GetImage
     * @apiGroup Media
     * @apiVersion 2.0.0
     *
     * @apiDescription Returns an image with the provided transformable effects applied. The image must be in the approved list of media in order to be returned.
     *
     * @apiParam {String} url Encoded image URL
     * @apiParam {Number} [blur] Amount to blur image
     * @apiParam {Number} [resize] Dimensions to resize the image, <width>x<height>, with a resize mode of "contain". If either value provided is "null", the resize will "fill" to the provided value.
     *
     * @apiExample {curl} Example Usage
     *                  curl -i https://api.clixtv.com/v2.0/media/image?url=https%3A%2F%2Fadvncedcdn.vo.llnwd.net%2Fclixtv_prod_storage%2Fstorage%2F57cdc2665aad0b6fcf67bb3d%2F57fd3884dfbef1000330d0ab%2Ffunnycover.jpg&blur=10
     *
     * @apiSuccess {Blob} image
     *
     * @apiError {String} error Error message if image was not able to be retrieved
     */
    this.registerGetMethod('/image', this.getTransformedImage);

    this.registerGetMethod('/image/id/:id', this.getImageById);

    this.registerGetMethod('/types', this.getMediaTypes);

    this.registerGetMethod('/embed/episode/video/slug/:slug', this.getEmbeddedEpisodeVideoBySlug);

    this.registerPostMethod('/', this.addMedia);
};

Controller.prototype.getMedia = async function(request, response) {
    let offset = parseInt(request.query.offset) || 0,
        limit = parseInt(request.query.limit) || 20;

    try {
        let data = await mediaService.getMedia(offset, limit);
        this.sendSuccess(response, data);
    } catch (e) {
        console.error(JSON.stringify(e, null, 4));
        this.sendServerError(response, {
            error: 'Error getting media'
        })
    }
};

Controller.prototype.getTransformedImage = async function(request, response) {
    let url = request.query.url;

    if (!url) {
        this.sendBadRequestError(response, {
            error: 'Image url is required'
        });
        return new Promise(() => {});
    }

    try {
        let data = await mediaService.getTransformedImage(url, new TransformableMediaRequestModel(request.query || {}));
        this.sendImageSuccess(response, data);
    } catch (e) {
        console.error(JSON.stringify(e, null, 4));
        this.sendServerError(response, {
            error: 'Error getting media'
        })
    }
};

Controller.prototype.getImageById = async function(request, response) {
    let id = request.params.id;

    try {
        let data = await mediaService.getMediaImageById(id);
        this.sendSuccess(response, data);
    } catch (e) {
        console.error(JSON.stringify(e, null, 4));
        if (e instanceof NotFoundErrorModel) {
            this.sendBadRequestError(response, {
                error: e.message
            });
        } else {
            this.sendServerError(response, {
                error: 'Error getting media'
            });
        }
    }
};

Controller.prototype.getMediaTypes = async function(request, response) {
    try {
        let data = await mediaService.getMediaTypes();
        this.sendSuccess(response, data);
    } catch (e) {
        console.error(JSON.stringify(e, null, 4));
        this.sendServerError(response, {
            error: 'Error getting media types'
        })
    }
};

Controller.prototype.getEmbeddedEpisodeVideoBySlug = async function(request, response) {
    const { slug } = request.params;
    try {
        let data = await mediaService.getEpisodeVideoBySlug(slug, request, response);
        response.setHeader('Content-Type', 'text/html');
        response.status(200).send(data);
    } catch (e) {
        console.error(e);
        this.sendServerError(response, {
            error: 'Error getting episode video by slug'
        })
    }
};

Controller.prototype.addMedia = async function(request, response) {
    let model = new MediaRequestModel(request.body),
        errorMessage = model.getErrorMessage();

    if (errorMessage) {
        this.sendBadRequestError(response, {
            error: errorMessage
        });
        return new Promise(() => {});
    }

    try {
        let data;
        if (model.base64Image) {
            data = await mediaService.addBase64Image(model.type, model.base64Image);
        } else {
            data = await mediaService.addVideo(model.type, model.video);
        }
        this.sendSuccess(response, data);
    } catch (e) {
        console.error(e);
        if (e instanceof InvalidRequestErrorModel) {
            this.sendBadRequestError(response, {
                error: e.message
            });
        } else {
            this.sendServerError(response, {
                error: 'Error adding media'
            });
        }
    }
};

module.exports = Controller;