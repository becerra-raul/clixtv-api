let util = require('util'),
    BaseController = require('./base-controller'),
    offerService = require('../services/offer-service');

function Controller(app) {
    if (!(this instanceof Controller)) {
        return new Controller(app);
    }
    BaseController.call(this, app, {
        path: '/offers'
    });
}

util.inherits(Controller, BaseController);

Controller.prototype.registerAllMethods = function() {

    this.registerGetMethod('/', this.getOffers);
    this.registerGetMethod('/sirqul/', this.getOffersSirqul);

    /**
     * @api {get} /offers/slug/:slug Get offer by slug
     * @apiName GetOfferBySlug
     * @apiGroup Offers
     * @apiVersion 2.0.0
     *
     * @apiDescription Looks up an offer matching the provided slug.
     *
     * @apiParam {String} slug Offer slug
     * @apiParam {String} [userid] User ID
     *
     * @apiSuccess {Object} success Offer object
     *
     * @apiError {String} error Error message if no offer was found.
     */
    this.registerGetMethod('/slug/:slug', this.getOfferBySlug);
    this.registerGetMethod('/sirqul/slug/:slug', this.getOfferBySlugSirqul);

    /**
     * @api {get} /offers/id/:id Get offer by ID
     * @apiName GetOfferById
     * @apiGroup Offers
     * @apiVersion 2.0.0
     *
     * @apiDescription Looks up an offer matching the provided ID.
     *
     * @apiParam {String} id Offer ID
     * @apiParam {String} [userid] User ID
     *
     * @apiSuccess {Object} success Offer object
     *
     * @apiError {String} error Error message if no offer was found.
     */
    this.registerGetMethod('/id/:id', this.getOfferById);
    this.registerGetMethod('/sirqul/id/:slug', this.getOfferByIdSirqul);
};

Controller.prototype.getOffers = async function(request, response) {
    let offset = parseInt(request.query.offset) || 0,
        limit = parseInt(request.query.limit) || 20,
        userId = request.query.userid;

    if (userId && !this.isAuthenticatedUser(request, userId)) {
        userId = undefined;
    }

    try {
        let brands = await offerService.getOffers(offset, limit, {
            fields: request.query.fields ? request.query.fields.split(',') : [],
            userId: userId
        });
        this.sendSuccess(response, brands);
    } catch (e) {
        console.error(e);
        this.sendServerError(response, {
            error: 'Error getting offers'
        })
    }
};

Controller.prototype.getOfferBySlug = async function(request, response) {
    let slug = request.params.slug,
        userId = request.query.userid;

    if (userId && !this.isAuthenticatedUser(request, userId)) {
        userId = undefined;
    }
    try {
        let offer = await offerService.getOfferBySlug(slug, {
            userId: userId
        });
        this.sendSuccess(response, offer);
    } catch (e) {
        console.error(e);
        this.sendServerError(response, {
            error: 'Error getting offer'
        })
    }
};

Controller.prototype.getOfferById = async function(request, response) {
    let id = request.params.id,
        userId = request.query.userid;

    if (userId && !this.isAuthenticatedUser(request, userId)) {
        userId = undefined;
    }

    try {
        let offer = await offerService.getOfferById(id, {
            userId: userId
        });
        this.sendSuccess(response, offer);
    } catch (e) {
        console.error(e);
        this.sendServerError(response, {
            error: 'Error getting offer'
        })
    }
};

Controller.prototype.getOffersSirqul = async function(request, response) {
    let offset = parseInt(request.query.offset) || 0,
        limit = parseInt(request.query.limit) || 20,
        userId = request.query.userid;

    if (userId && !this.isAuthenticatedUser(request, userId)) {
        userId = undefined;
    }

    try {
        let brands = await offerService.getOffersSirqul(offset, limit, {
            fields: request.query.fields ? request.query.fields.split(',') : [],
            userId: userId,
            keyword: request.query.keyword,
            sortField: request.query.sortField
        });
        this.sendSuccess(response, brands);
    } catch (e) {
        console.error(e);
        this.sendServerError(response, {
            error: 'Error getting offers'
        })
    }
};

Controller.prototype.getOfferBySlugSirqul = async function(request, response) {
    request.params.id = request.params.slug;
    this.getOfferByIdSirqul(request, response);
}

Controller.prototype.getOfferByIdSirqul = async function(request, response) {
    let id = request.params.id,
        userId = request.query.userid;

    if (userId && !this.isAuthenticatedUser(request, userId)) {
        userId = undefined;
    }

    try {
        let offer = await offerService.getOfferByIdSirqul(id, {
            userId: userId
        });
        this.sendSuccess(response, offer);
    } catch (e) {
        console.error(e);
        this.sendServerError(response, {
            error: 'Error getting offer'
        })
    }
};

module.exports = Controller;