let util = require('util'),
    BaseController = require('./base-controller'),
    brandService = require('../services/brand-service');

function Controller(app) {
    if (!(this instanceof Controller)) {
        return new Controller(app);
    }
    BaseController.call(this, app, {
        path: '/brands'
    });
}

util.inherits(Controller, BaseController);

Controller.prototype.registerAllMethods = function() {

    /**
     * @api {get} /brands Get brands
     * @apiName GetBrands
     * @apiGroup Brands
     * @apiVersion 2.0.0
     *
     * @apiDescription Returns all brands
     *
     * @apiParam {Number} [offset = 0] Number of brands to offset
     * @apiParam {Number} [limit = 20] Total number of brands to return
     * @apiParam {String} [userid] User ID
     *
     * @apiExample {curl} Example Usage
     *                  curl -i https://api.clixtv.com/v2.0/brands?offset=0&limit=20
     *
     * @apiUse BrandListResponseModel
     *
     * @apiError {String} error Error message if no brands were found
     */
    this.registerGetMethod('/', this.getBrands);
    this.registerGetMethod('/sirqul', this.getBrandsSirqul);

    /**
     * @api {get} /brands/slug/:slug Get brand by slug
     * @apiName GetBrandBySlug
     * @apiGroup Brands
     * @apiVersion 2.0.0
     *
     * @apiDescription Looks up a brand matching the provided slug.
     *
     * @apiParam {String} slug Brand slug
     * @apiParam {String} [fields] Comma delimited list of additional fields to return (Ex. "offers,stars")
     * @apiParam {String} [userid] User ID
     *
     * @apiUse BrandResponseModel
     *
     * @apiError {String} error Error message if no brand was found.
     */
    this.registerGetMethod('/slug/:slug', this.getBrandBySlug);
    this.registerGetMethod('/sirqul/slug/:slug', this.getBrandBySlugSirqul);

    /**
     * @api {get} /brands/id/:id Get brand by ID
     * @apiName GetBrandById
     * @apiGroup Brands
     * @apiVersion 2.0.0
     *
     * @apiDescription Looks up a brand matching the provided ID.
     *
     * @apiParam {String} id Brand ID
     * @apiParam {String} [fields] Comma delimited list of additional fields to return (Ex. "offers,stars")
     * @apiParam {String} [userid] User ID
     *
     * @apiUse BrandResponseModel
     *
     * @apiError {String} error Error message if no brand was found.
     */
    this.registerGetMethod('/id/:id', this.getBrandById);
    this.registerGetMethod('/sirqul/id/:id', this.getBrandByIdSirqul);

    /**
     * @api {get} /brands/slug/:slug/stars Get brand stars
     * @apiName GetStarsByBrandSlug
     * @apiGroup Brands
     * @apiVersion 2.0.0
     *
     * @apiDescription Returns the stars for the provided brand slug
     *
     * @apiParam {String} slug Brand slug
     * @apiParam {Number} [offsetepisodes = 0] Number of episodes per star to offset
     * @apiParam {Number} [limitepisodes = 20] Total number of episodes per star to return
     * @apiParam {String} [userid] User ID
     *
     * @apiExample {curl} Example Usage
     *                  curl -i https://api.clixtv.com/v2.0/brands/slug/mcdonalds/stars
     *
     * @apiUse StarListResponseModel
     *
     * @apiError {String} error Error message if no brand was found.
     */
    this.registerGetMethod('/slug/:slug/stars', this.getStarsByBrandSlug);

    /**
     * @api {get} /brands/slug/:slug/offers Get brand offers
     * @apiName GetOffersByBrandSlug
     * @apiGroup Brands
     * @apiVersion 2.0.0
     *
     * @apiDescription Returns the offers for the provided brand slug
     *
     * @apiParam {String} slug Brand slug
     * @apiParam {Number} [offset = 0] Number of offers to offset
     * @apiParam {Number} [limit = 20] Total number of offers to return
     * @apiParam {String} [userid] User ID
     *
     * @apiExample {curl} Example Usage
     *                  curl -i https://api.clixtv.com/v2.0/brands/slug/mcdonalds/offers
     *
     * @apiUse OfferListResponseModel
     *
     * @apiError {String} error Error message if no brand was found.
     */
    this.registerGetMethod('/slug/:slug/offers', this.getOffersByBrandSlug);

    /**
     * @api {get} /brands/slug/:slug/episodes Get brand episodes
     * @apiName GetEpisodesByBrandSlug
     * @apiGroup Brands
     * @apiVersion 2.0.0
     *
     * @apiDescription Returns the episodes for the provided brand slug
     *
     * @apiParam {String} slug Brand slug
     * @apiParam {Number} [offset = 0] Number of episodes to offset
     * @apiParam {Number} [limit = 20] Total number of episodes to return
     * @apiParam {String} [userid] User ID
     *
     * @apiExample {curl} Example Usage
     *                  curl -i https://api.clixtv.com/v2.0/brands/slug/mcdonalds/episodes
     *
     * @apiUse EpisodeListResponseModel
     *
     * @apiError {String} error Error message if no brand was found.
     */
    this.registerGetMethod('/slug/:slug/episodes', this.getEpisodesByBrandSlug);

    /**
     * @api {get} /brands/slug/:slug/stars/slug/:starslug Get brand star
     * @apiName GetStarByBrandSlug
     * @apiGroup Brands
     * @apiVersion 2.0.0
     *
     * @apiDescription Returns the star for the provided brand slug
     *
     * @apiParam {String} slug Brand slug
     * @apiParam {String} starslug Star slug
     * @apiParam {Number} [offsetepisodes = 0] Number of episodes to offset
     * @apiParam {Number} [limitepisodes = 20] Total number of episodes to return
     * @apiParam {String} [userid] User ID
     *
     * @apiExample {curl} Example Usage
     *                  curl -i https://api.clixtv.com/v2.0/brands/slug/mcdonalds/stars/slug/follow-me
     *
     * @apiUse StarResponseModel
     *
     * @apiError {String} error Error message if no brand or star was found.
     */
    this.registerGetMethod('/slug/:slug/stars/slug/:starslug', this.getStarByBrandSlug);
};

Controller.prototype.getBrands = async function(request, response) {
    let offset = parseInt(request.query.offset) || 0,
        limit = parseInt(request.query.limit) || 20,
        userId = request.query.userid;

    if (userId && !this.isAuthenticatedUser(request, userId)) {
        userId = undefined;
    }

    try {
        let brands = await brandService.getBrands(offset, limit, {
            fields: request.query.fields ? request.query.fields.split(',') : [],
            userId: userId
        });
        this.sendSuccess(response, brands);
    } catch (e) {
        console.error(e);
        this.sendServerError(response, {
            error: 'Error getting brands'
        })
    }
};

Controller.prototype.getBrandBySlug = async function(request, response) {
    let slug = request.params.slug,
        userId = request.query.userid;

    if (userId && !this.isAuthenticatedUser(request, userId)) {
        userId = undefined;
    }

    try {
        let brand = await brandService.getBrandBySlug(slug, {
            fields: request.query.fields ? request.query.fields.split(',') : [],
            userId: userId
        });
        this.sendSuccess(response, brand);
    } catch (e) {
        console.error(e);
        this.sendServerError(response, {
            error: 'Error getting brand'
        })
    }
};

Controller.prototype.getBrandById = async function(request, response) {
    let id = request.params.id,
        userId = request.query.userid;

    if (userId && !this.isAuthenticatedUser(request, userId)) {
        userId = undefined;
    }

    try {
        let brand = await brandService.getBrandById(id, {
            fields: request.query.fields ? request.query.fields.split(',') : [],
            userId: userId
        });
        this.sendSuccess(response, brand);
    } catch (e) {
        console.error(e);
        this.sendServerError(response, {
            error: 'Error getting brand'
        })
    }
};

Controller.prototype.getStarsByBrandSlug = async function(request, response) {
    let slug = request.params.slug,
        offsetEpisodes = parseInt(request.query.offsetepisodes) || 0,
        limitEpisodes = parseInt(request.query.limitepisodes) || 20,
        userId = request.query.userid;

    if (userId && !this.isAuthenticatedUser(request, userId)) {
        userId = undefined;
    }

    try {
        let brand = await brandService.getStarsByBrandSlug(slug, {
            offsetEpisodes: offsetEpisodes,
            limitEpisodes: limitEpisodes,
            userId: userId
        });
        this.sendSuccess(response, brand);
    } catch (e) {
        console.error(e);
        this.sendServerError(response, {
            error: 'Error getting stars for brand'
        })
    }
};

Controller.prototype.getOffersByBrandSlug = async function(request, response) {
    let slug = request.params.slug,
        offset = parseInt(request.query.offset) || 0,
        limit = parseInt(request.query.limit) || 20,
        userId = request.query.userid;

    if (userId && !this.isAuthenticatedUser(request, userId)) {
        userId = undefined;
    }

    try {
        let brand = await brandService.getOffersByBrandSlug(slug, {
            offset: offset,
            limit: limit,
            userId: userId
        });
        this.sendSuccess(response, brand);
    } catch (e) {
        console.error(e);
        this.sendServerError(response, {
            error: 'Error getting offers for brand'
        })
    }
};

Controller.prototype.getEpisodesByBrandSlug = async function(request, response) {
    let slug = request.params.slug,
        offset = parseInt(request.query.offset) || 0,
        limit = parseInt(request.query.limit) || 20,
        userId = request.query.userid;

    if (userId && !this.isAuthenticatedUser(request, userId)) {
        userId = undefined;
    }

    try {
        let brand = await brandService.getEpisodesByBrandSlug(slug, {
            offset: offset,
            limit: limit,
            userId: userId
        });
        this.sendSuccess(response, brand);
    } catch (e) {
        console.error(e);
        this.sendServerError(response, {
            error: 'Error getting episodes for brand'
        })
    }
};

Controller.prototype.getStarByBrandSlug = async function(request, response) {
    let slug = request.params.slug,
        starSlug = request.params.starslug,
        offsetEpisodes = parseInt(request.query.offsetepisodes) || 0,
        limitEpisodes = parseInt(request.query.limitepisodes) || 20,
        userId = request.query.userid;

    if (userId && !this.isAuthenticatedUser(request, userId)) {
        userId = undefined;
    }

    try {
        let brand = await brandService.getStarByBrandSlug(slug, starSlug, {
            offsetEpisodes: offsetEpisodes,
            limitEpisodes: limitEpisodes,
            userId: userId
        });
        this.sendSuccess(response, brand);
    } catch (e) {
        console.error(e);
        this.sendServerError(response, {
            error: 'Error getting stars for brand'
        })
    }
};

Controller.prototype.getBrandsSirqul = async function(request, response) {
    let offset = parseInt(request.query.offset) || 0,
        limit = parseInt(request.query.limit) || 20,
        userId = request.query.userid;

    if (userId && !this.isAuthenticatedUser(request, userId)) {
        userId = undefined;
    }

    try {
        let brands = await brandService.getBrandsSirqul(offset, limit, {
            fields: request.query.fields ? request.query.fields.split(',') : [],
            userId: userId,
            keyword: request.query.keyword,
            sortField: request.query.sortField
        });
        this.sendSuccess(response, brands);
    } catch (e) {
        console.error(e);
        this.sendServerError(response, {
            error: 'Error getting brands'
        })
    }
};

Controller.prototype.getBrandBySlugSirqul = async function(request, response){
    let slug = request.params.slug,
        offsetEpisodes = parseInt(request.query.offsetepisodes) || 0,
        limitEpisodes = parseInt(request.query.limitepisodes) || 20,
        offsetOffers = parseInt(request.query.offsetoffers) || 0,
        limitOffers = parseInt(request.query.limitoffers) || 20,
        userId = request.query.userid;


    if (userId && !this.isAuthenticatedUser(request, userId)) {
        userId = undefined;
    }

    try {
        let brand = await brandService.getBrandBySlugSirqul(slug, {
            fields: request.query.fields ? request.query.fields.split(',') : [],
            offsetEpisodes: offsetEpisodes,
            limitEpisodes: limitEpisodes,
            offsetOffers: offsetOffers,
            limitOffers: limitOffers,
            userId: userId
        });
        this.sendSuccess(response, brand);
    } catch (e) {
        console.error(e);
        this.sendServerError(response, {
            error: 'Error getting brand'
        })
    }
}

Controller.prototype.getBrandByIdSirqul = async function(request, response) {
    let id = request.params.id,
        offsetEpisodes = parseInt(request.query.offsetepisodes) || 0,
        limitEpisodes = parseInt(request.query.limitepisodes) || 20,
        offsetOffers = parseInt(request.query.offsetoffers) || 0,
        limitOffers = parseInt(request.query.limitoffers) || 20,
        userId = request.query.userid;


    if (userId && !this.isAuthenticatedUser(request, userId)) {
        userId = undefined;
    }

    try {
        let brand = await brandService.getBrandByIdSirqul(id, {
            fields: request.query.fields ? request.query.fields.split(',') : [],
            offsetEpisodes: offsetEpisodes,
            limitEpisodes: limitEpisodes,
            offsetOffers: offsetOffers,
            limitOffers: limitOffers,
            userId: userId
        });
        this.sendSuccess(response, brand);
    } catch (e) {
        console.error(e);
        this.sendServerError(response, {
            error: 'Error getting brand'
        })
    }
};


module.exports = Controller;