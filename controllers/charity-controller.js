let util = require('util'),
    BaseController = require('./base-controller'),
    charityService = require('../services/charity-service');

function Controller(app) {
    if (!(this instanceof Controller)) {
        return new Controller(app);
    }
    BaseController.call(this, app, {
        path: '/charities'
    });
}

util.inherits(Controller, BaseController);

Controller.prototype.registerAllMethods = function() {

    /**
     * @api {get} /charities Get charities
     * @apiName GetCharities
     * @apiGroup Charities
     * @apiVersion 2.0.0
     *
     * @apiDescription Returns all charities
     *
     * @apiParam {Number} [offset = 0] Number of charities to offset
     * @apiParam {Number} [limit = 20] Total number of charities to return
     * @apiParam {String = "date", "name"} [sort = "-date"] Sort key of the charities, prefixed by the sort direction ("-" is descending, "+" is ascending)
     * @apiParam {String} [userid] User ID
     *
     * @apiExample {curl} Example Usage
     *                  curl -i https://api.clixtv.com/v2.0/charities?offset=0&limit=20&sort=+name
     *
     * @apiUse CharityListResponseModel
     *
     * @apiError {String} error Error message if no charities were found
     */
    this.registerGetMethod('/', this.getCharities);
    this.registerGetMethod('/sirqul', this.getCharitiesSirqul);

    /**
     * @api {get} /charities/slug/:slug Get charity by slug
     * @apiName GetCharityBySlug
     * @apiGroup Charities
     * @apiVersion 2.0.0
     *
     * @apiDescription Looks up a charity matching the provided slug.
     *
     * @apiParam {String} slug Charity slug
     * @apiParam {String} [fields] Comma delimited list of additional fields to return (Ex. "episodes,stars")
     * @apiParam {String} [userid] User ID
     *
     * @apiExample {curl} Example Usage
     *                  curl -i https://api.clixtv.com/v2.0/charities/slug/special-olympics?fields=episodes
     *
     * @apiUse CharityResponseModel
     *
     * @apiError {String} error Error message if no charity was found.
     */
    this.registerGetMethod('/slug/:slug', this.getCharityBySlug);
    this.registerGetMethod('/sirqul/slug/:slug', this.getCharityBySlugSirqul);

    /**
     * @api {get} /charities/slug/:slug Get charity by ID
     * @apiName GetCharityById
     * @apiGroup Charities
     * @apiVersion 2.0.0
     *
     * @apiDescription Looks up a charity matching the provided ID.
     *
     * @apiParam {String} id Charity ID
     * @apiParam {String} [fields] Comma delimited list of additional fields to return (Ex. "episodes,stars")
     * @apiParam {String} [userid] User ID
     *
     * @apiExample {curl} Example Usage
     *                  curl -i https://api.clixtv.com/v2.0/charities/id/5911e4f332399a7577df3482?fields=episodes
     *
     * @apiUse CharityResponseModel
     *
     * @apiError {String} error Error message if no charity was found.
     */
    this.registerGetMethod('/id/:id', this.getCharityById);
    this.registerGetMethod('/sirqul/id/:id', this.getCharityByIdSirqul);

    /**
     * @api {get} /charities/slug/:slug/stars Get charity stars
     * @apiName GetStarsByCharitySlug
     * @apiGroup Charities
     * @apiVersion 2.0.0
     *
     * @apiDescription Returns the stars for the provided charity slug
     *
     * @apiParam {String} slug Charity slug
     * @apiParam {Number} [offsetepisodes = 0] Number of episodes per star to offset
     * @apiParam {Number} [limitepisodes = 20] Total number of episodes per star to return
     *
     * @apiExample {curl} Example Usage
     *                  curl -i https://api.clixtv.com/v2.0/charities/slug/special-olympics/stars
     *
     * @apiUse StarListResponseModel
     *
     * @apiError {String} error Error message if no charity was found.
     */
    this.registerGetMethod('/slug/:slug/stars', this.getStarsByCharitySlug);

    /**
     * @api {get} /charities/slug/:slug/episodes Get charity episodes
     * @apiName GetEpisodesByCharitySlug
     * @apiGroup Charities
     * @apiVersion 2.0.0
     *
     * @apiDescription Returns the episodes for the provided charity slug
     *
     * @apiParam {String} slug Charity slug
     * @apiParam {Number} [offset = 0] Number of episodes to offset
     * @apiParam {Number} [limit = 20] Total number of episodes to return
     *
     * @apiExample {curl} Example Usage
     *                  curl -i https://api.clixtv.com/v2.0/charities/slug/special-olympics/episodes
     *
     * @apiUse EpisodeListResponseModel
     *
     * @apiError {String} error Error message if no charity was found.
     */
    this.registerGetMethod('/slug/:slug/episodes', this.getEpisodesByCharitySlug);

    /**
     * @api {get} /charities/slug/:slug/stars/slug/:starslug Get charity star
     * @apiName GetStarByCharitySlug
     * @apiGroup Charities
     * @apiVersion 2.0.0
     *
     * @apiDescription Returns the star for the provided charity slug
     *
     * @apiParam {String} slug Charity slug
     * @apiParam {String} starslug Star slug
     * @apiParam {Number} [offsetepisodes = 0] Number of episodes to offset
     * @apiParam {Number} [limitepisodes = 20] Total number of episodes to return
     *
     * @apiExample {curl} Example Usage
     *                  curl -i https://api.clixtv.com/v2.0/charities/slug/special-olympics/stars/slug/follow-me
     *
     * @apiUse StarResponseModel
     *
     * @apiError {String} error Error message if no charity or star was found.
     */
    this.registerGetMethod('/slug/:slug/stars/slug/:starslug', this.getStarByCharitySlug);
};

Controller.prototype.getCharities = async function(request, response) {
    let offset = parseInt(request.query.offset) || 0,
        limit = parseInt(request.query.limit) || 20,
        sort = request.query.sort || '-date',
        userId = request.query.userid;

    if (userId && !this.isAuthenticatedUser(request, userId)) {
        userId = undefined;
    }

    try {
        let categories = await charityService.getCharities(offset, limit, {
            fields: request.query.fields ? request.query.fields.split(',') : [],
            sort: sort,
            userId: userId
        });
        this.sendSuccess(response, categories);
    } catch (e) {
        console.error(e);
        this.sendServerError(response, {
            error: 'Error getting charities'
        })
    }
};

Controller.prototype.getCharityBySlug = async function(request, response) {
    let slug = request.params.slug,
        userId = request.query.userid;

    if (userId && !this.isAuthenticatedUser(request, userId)) {
        userId = undefined;
    }

    try {
        let charity = await charityService.getCharityBySlug(slug, {
            fields: request.query.fields ? request.query.fields.split(',') : [],
            userId: userId
        });
        this.sendSuccess(response, charity);
    } catch (e) {
        console.error(e);
        this.sendServerError(response, {
            error: 'Error getting charity'
        })
    }
};

Controller.prototype.getCharityById = async function(request, response) {
    let id = request.params.id,
        userId = request.query.userid;

    if (userId && !this.isAuthenticatedUser(request, userId)) {
        userId = undefined;
    }

    try {
        let charity = await charityService.getCharityById(id, {
            fields: request.query.fields ? request.query.fields.split(',') : [],
            userId: userId
        });
        this.sendSuccess(response, charity);
    } catch (e) {
        console.error(e);
        this.sendServerError(response, {
            error: 'Error getting charity'
        })
    }
};

Controller.prototype.getStarsByCharitySlug = async function(request, response) {
    let slug = request.params.slug,
        offsetEpisodes = parseInt(request.query.offsetepisodes) || 0,
        limitEpisodes = parseInt(request.query.limitepisodes) || 20,
        userId = request.query.userid;

    if (userId && !this.isAuthenticatedUser(request, userId)) {
        userId = undefined;
    }

    try {
        let brand = await charityService.getStarsByCharitySlug(slug, {
            offsetEpisodes: offsetEpisodes,
            limitEpisodes: limitEpisodes,
            userId: userId
        });
        this.sendSuccess(response, brand);
    } catch (e) {
        console.error(e);
        this.sendServerError(response, {
            error: 'Error getting stars for charity'
        })
    }
};

Controller.prototype.getEpisodesByCharitySlug = async function(request, response) {
    let slug = request.params.slug,
        offset = parseInt(request.query.offset) || 0,
        limit = parseInt(request.query.limit) || 20,
        userId = request.query.userid;

    if (userId && !this.isAuthenticatedUser(request, userId)) {
        userId = undefined;
    }

    try {
        let brand = await charityService.getEpisodesByCharitySlug(slug, {
            offset: offset,
            limit: limit,
            userId: userId
        });
        this.sendSuccess(response, brand);
    } catch (e) {
        console.error(e);
        this.sendServerError(response, {
            error: 'Error getting episodes for charity'
        })
    }
};

Controller.prototype.getStarByCharitySlug = async function(request, response) {
    let slug = request.params.slug,
        starSlug = request.params.starslug,
        offsetEpisodes = parseInt(request.query.offsetepisodes) || 0,
        limitEpisodes = parseInt(request.query.limitepisodes) || 20,
        userId = request.query.userid;

    if (userId && !this.isAuthenticatedUser(request, userId)) {
        userId = undefined;
    }

    try {
        let brand = await charityService.getStarByCharitySlug(slug, starSlug, {
            offsetEpisodes: offsetEpisodes,
            limitEpisodes: limitEpisodes,
            userId: userId
        });
        this.sendSuccess(response, brand);
    } catch (e) {
        console.error(e);
        this.sendServerError(response, {
            error: 'Error getting stars for charity'
        })
    }
};

Controller.prototype.getCharitiesSirqul = async function(request, response) {
    let offset = parseInt(request.query.offset) || 0,
        limit = parseInt(request.query.limit) || 20,
        sort = request.query.sort || '-date',
        userId = request.query.userid;

    if (userId && !this.isAuthenticatedUser(request, userId)) {
        userId = undefined;
    }

    try {
        let categories = await charityService.getCharitiesSirqul(offset, limit, {
            fields: request.query.fields ? request.query.fields.split(',') : [],
            sort: sort,
            userId: userId,
            keyword: request.query.keyword,
            sortField: request.query.sortField
        });
        this.sendSuccess(response, categories);
    } catch (e) {
        console.error(e);
        this.sendServerError(response, {
            error: 'Error getting charities'
        })
    }
};

Controller.prototype.getCharityBySlugSirqul = async function(request, response) {
    let slug = request.params.slug,
        userId = request.query.userid,
        offsetEpisodes = parseInt(request.query.offsetepisodes) || 0,
        limitEpisodes = parseInt(request.query.limitepisodes) || 20;

    if (userId && !this.isAuthenticatedUser(request, userId)) {
        userId = undefined;
    }

    try {
        let charity = await charityService.getCharityBySlugSirqul(slug, {
            fields: request.query.fields ? request.query.fields.split(',') : [],
            userId: userId,
            offsetEpisodes: offsetEpisodes,
            limitEpisodes: limitEpisodes
        });
        this.sendSuccess(response, charity);
    } catch (e) {
        console.error(e);
        this.sendServerError(response, {
            error: 'Error getting charity'
        })
    }
};

Controller.prototype.getCharityByIdSirqul = async function(request, response) {
    let id = request.params.id,
        userId = request.query.userid,
        offsetEpisodes = parseInt(request.query.offsetepisodes) || 0,
        limitEpisodes = parseInt(request.query.limitepisodes) || 20;

    if (userId && !this.isAuthenticatedUser(request, userId)) {
        userId = undefined;
    }

    try {
        let charity = await charityService.getCharityByIdSirqul(id, {
            fields: request.query.fields ? request.query.fields.split(',') : [],
            userId: userId,
            offsetEpisodes: offsetEpisodes,
            limitEpisodes: limitEpisodes
        });
        this.sendSuccess(response, charity);
    } catch (e) {
        console.error(e);
        this.sendServerError(response, {
            error: 'Error getting charity'
        })
    }
};

module.exports = Controller;