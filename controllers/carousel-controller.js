let util = require('util'),
    BaseController = require('./base-controller'),
    carouselService = require('../services/carousel-service');

function Controller(app) {
    if (!(this instanceof Controller)) {
        return new Controller(app);
    }
    BaseController.call(this, app, {
        path: '/carousels'
    });
}

util.inherits(Controller, BaseController);

Controller.prototype.registerAllMethods = function() {

    /**
     * @api {get} /carousels/slug/:slug Get carousel by slug
     * @apiName GetCarouselBySlug
     * @apiGroup Carousels
     * @apiVersion 2.0.0
     *
     * @apiDescription Looks up a carousel matching the provided slug.
     *
     * @apiParam {String} slug Carousel slug
     *
     * @apiUse CarouselResponseModel
     *
     * @apiError {String} error Error message if no carousel was found.
     */
    this.registerGetMethod('/slug/:slug', this.getCarouselBySlug);
};

Controller.prototype.getCarouselBySlug = async function(request, response) {
    const slug = request.params.slug;

    try {
        let carousel = await carouselService.getCarouselBySlug(slug);
        this.sendSuccess(response, carousel);
    } catch (e) {
        console.error(e);
        this.sendServerError(response, {
            error: 'Error getting carousel'
        })
    }
};

module.exports = Controller;