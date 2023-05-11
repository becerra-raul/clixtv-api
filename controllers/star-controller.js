let util = require('util'),
    BaseController = require('./base-controller'),
    starService = require('../services/star-service'),
    StarRequestModel = require('../models/request/star-request-model'),
    DuplicateEntryErrorModel = require('../models/duplicate-entry-error-model'),
    NotFoundErrorModel = require('../models/not-found-error-model');

function Controller(app) {
    if (!(this instanceof Controller)) {
        return new Controller(app);
    }
    BaseController.call(this, app, {
        path: '/stars'
    });
}

util.inherits(Controller, BaseController);

Controller.prototype.registerAllMethods = function() {

    /**
     * @api {get} /stars Get stars
     * @apiName GetStars
     * @apiGroup Stars
     * @apiVersion 2.0.0
     *
     * @apiDescription Returns all stars
     *
     * @apiParam {Number} [offset = 0] Number of stars to offset
     * @apiParam {Number} [limit = 20] Total number of stars to return
     * @apiParam {String = "date", "name"} [sort = "-date"] Sort key of the stars, prefixed by the sort direction ("-" is descending, "+" is ascending)
     * @apiParam {String} [userid] User ID
     *
     * @apiExample {curl} Example Usage
     *                  curl -i https://api.clixtv.com/v2.0/stars?offset=0&limit=20
     *
     * @apiSuccess {Object} success List of stars
     *
     * @apiError {String} error Error message if no stars were found
     */
    this.registerGetMethod('/', this.getStars);
    this.registerGetMethod('/sirqul', this.getStarsSirqul);

    /**
     * @api {get} /stars/slug/:slug Get star by slug
     * @apiName GetStarBySlug
     * @apiGroup Stars
     * @apiVersion 2.0.0
     *
     * @apiDescription Looks up a star matching the provided slug.
     *
     * @apiParam {String} slug Star slug
     * @apiParam {String} [fields] Comma delimited list of additional fields to return (Ex. "episodes,series")
     * @apiParam {String} [userid] User ID
     *
     * @apiSuccess {Object} success Star object
     *
     * @apiError {String} error Error message if no star was found.
     */
    this.registerGetMethod('/slug/:slug', this.getStarBySlug);
    // for sirqul, slug is the same as is id
    this.registerGetMethod('/sirqul/slug/:slug', this.getStarBySlugSirqul);

    /**
     * @api {get} /stars/id/:id Get star by ID
     * @apiName GetStarById
     * @apiGroup Stars
     * @apiVersion 2.0.0
     *
     * @apiDescription Looks up a star matching the provided ID.
     *
     * @apiParam {String} id Star ID
     * @apiParam {String} [fields] Comma delimited list of additional fields to return (Ex. "episodes,series")
     * @apiParam {String} [userid] User ID
     *
     * @apiSuccess {Object} success Star object
     *
     * @apiError {String} error Error message if no star was found.
     */
    this.registerGetMethod('/id/:id', this.getStarById);
    this.registerGetMethod('/sirqul/id/:id', this.getStarByIdSirqul);

    /**
     * @api {get} /stars/slug/:slug/episodes Get star episodes
     * @apiName GetEpisodesByStarSlug
     * @apiGroup Stars
     * @apiVersion 2.0.0
     *
     * @apiDescription Returns the episodes for the provided star slug
     *
     * @apiParam {String} slug Star slug
     * @apiParam {Number} [offset = 0] Number of episodes to offset
     * @apiParam {Number} [limit = 20] Total number of episodes to return
     * @apiParam {String} [userid] User ID
     *
     * @apiExample {curl} Example Usage
     *                  curl -i https://api.clixtv.com/v2.0/stars/slug/follow-me/episodes
     *
     * @apiUse EpisodeListResponseModel
     *
     * @apiError {String} error Error message if no star was found.
     */
    this.registerGetMethod('/slug/:slug/episodes', this.getEpisodesByStarSlug);

    /**
     * @api {get} /stars/slug/:slug/series Get star series
     * @apiName GetSeriesByStarSlug
     * @apiGroup Stars
     * @apiVersion 2.0.0
     *
     * @apiDescription Returns the series for the provided star slug
     *
     * @apiParam {String} slug Star slug
     * @apiParam {Number} [offset = 0] Number of series to offset
     * @apiParam {Number} [limit = 20] Total number of series to return
     * @apiParam {String} [userid] User ID
     *
     * @apiExample {curl} Example Usage
     *                  curl -i https://api.clixtv.com/v2.0/stars/slug/follow-me/series
     *
     * @apiUse SeriesListResponseModel
     *
     * @apiError {String} error Error message if no star was found.
     */
    this.registerGetMethod('/slug/:slug/series', this.getSeriesByStarSlug);

    this.registerPostMethod('/', this.addStar);

    this.registerPutMethod('/id/:id', this.updateStarById);
};

Controller.prototype.getStars = async function(request, response) {
    let offset = parseInt(request.query.offset) || 0,
        limit = parseInt(request.query.limit) || 20,
        sort = request.query.sort || '-date',
        userId = request.query.userid;

    if (userId && !this.isAuthenticatedUser(request, userId)) {
        userId = undefined;
    }

    try {
        let stars = await starService.getStars(offset, limit, {
            fields: request.query.fields ? request.query.fields.split(',') : [],
            sort: sort,
            userId: userId
        });
        this.sendSuccess(response, stars);
    } catch (e) {
        console.error(e);
        this.sendServerError(response, {
            error: 'Error getting stars'
        })
    }
};

Controller.prototype.getStarBySlug = async function(request, response) {
    let slug = request.params.slug,
        userId = request.query.userid;

    if (userId && !this.isAuthenticatedUser(request, userId)) {
        userId = undefined;
    }

    try {
        let star = await starService.getStarBySlug(slug, {
            fields: request.query.fields ? request.query.fields.split(',') : [],
            userId: userId,
        });
        this.sendSuccess(response, star);
    } catch (e) {
        console.error(e);
        this.sendServerError(response, {
            error: 'Error getting star'
        })
    }
};

Controller.prototype.getStarById = async function(request, response) {
    let id = request.params.id,
        userId = request.query.userid;

    if (userId && !this.isAuthenticatedUser(request, userId)) {
        userId = undefined;
    }

    try {
        let star = await starService.getStarById(id, {
            fields: request.query.fields ? request.query.fields.split(',') : [],
            userId: userId
        });
        this.sendSuccess(response, star);
    } catch (e) {
        console.error(e);
        this.sendServerError(response, {
            error: 'Error getting star'
        })
    }
};

Controller.prototype.getEpisodesByStarSlug = async function(request, response) {
    let slug = request.params.slug,
        offset = parseInt(request.query.offset) || 0,
        limit = parseInt(request.query.limit) || 20,
        userId = request.query.userid;

    if (userId && !this.isAuthenticatedUser(request, userId)) {
        userId = undefined;
    }

    try {
        let star = await starService.getEpisodesByStarSlug(slug, {
            offset: offset,
            limit: limit,
            userId: userId
        });
        this.sendSuccess(response, star);
    } catch (e) {
        console.error(e);
        this.sendServerError(response, {
            error: 'Error getting episodes for star'
        })
    }
};

Controller.prototype.getSeriesByStarSlug = async function(request, response) {
    let slug = request.params.slug,
        offset = parseInt(request.query.offset) || 0,
        limit = parseInt(request.query.limit) || 20,
        userId = request.query.userid;

    if (userId && !this.isAuthenticatedUser(request, userId)) {
        userId = undefined;
    }

    try {
        let star = await starService.getSeriesByStarSlug(slug, {
            offset: offset,
            limit: limit,
            userId: userId
        });
        this.sendSuccess(response, star);
    } catch (e) {
        console.error(e);
        this.sendServerError(response, {
            error: 'Error getting series for star'
        })
    }
};

Controller.prototype.addStar = async function(request, response) {
    // if (request.accessLevels.indexOf('ADMIN') === -1) {
    //     this.sendForbiddenError(response, {
    //         error: 'Invalid permissions to add category'
    //     });
    //     return new Promise(() => {});
    // }

    let model = new StarRequestModel(request.body),
        errorMessage = model.getErrorMessage();

    if (errorMessage) {
        this.sendBadRequestError(response, {
            error: errorMessage
        });
        return new Promise(() => {});
    }

    try {
        let star = await starService.addStar(model);
        this.sendSuccess(response, star);
    } catch (e) {
        console.error(e);
        if (e instanceof DuplicateEntryErrorModel) {
            this.sendBadRequestError(response, {
                error: e.message
            });
        } else {
            this.sendServerError(response, {
                error: 'Error adding star'
            });
        }
    }
};

Controller.prototype.updateStarById = async function(request, response) {
    // if (request.accessLevels.indexOf('ADMIN') === -1) {
    //     this.sendForbiddenError(response, {
    //         error: 'Invalid permissions to update category'
    //     });
    //     return new Promise(() => {});
    // }

    let id = request.params.id,
        model = new StarRequestModel(request.body);

    try {
        let star = await starService.updateStarById(id, model);
        this.sendSuccess(response, star);
    } catch (e) {
        console.error(e);
        if ((e instanceof DuplicateEntryErrorModel) || (e instanceof NotFoundErrorModel)) {
            this.sendBadRequestError(response, {
                error: e.message
            });
        } else {
            this.sendServerError(response, {
                error: 'Error updating star'
            });
        }
    }
};

Controller.prototype.getStarsSirqul = async function(request, response) {
    let offset = parseInt(request.query.offset) || 0,
        limit = parseInt(request.query.limit) || 20,
        sort = request.query.sort || '-date',
        userId = request.query.userid;

    if (userId && !this.isAuthenticatedUser(request, userId)) {
        userId = undefined;
    }

    try {
        let stars = await starService.getStarsSirqul(offset, limit, {
            fields: request.query.fields ? request.query.fields.split(',') : [],
            sort: sort,
            userId: userId
        });
        this.sendSuccess(response, stars);
    } catch (e) {
        console.error(e);
        this.sendServerError(response, {
            error: 'Error getting stars'
        });
    }
};

Controller.prototype.getStarBySlugSirqul = async function(request, response) {
    let slug = request.params.slug,
        userId = request.query.userid,
        offsetEpisodes = parseInt(request.query.offsetepisodes) || 0,
        limitEpisodes = parseInt(request.query.limitepisodes) || 20;

    if (userId && !this.isAuthenticatedUser(request, userId)) {
        userId = undefined;
    }

    try {
        let star = await starService.getStarBySlugSirqul(slug, {
            fields: request.query.fields ? request.query.fields.split(',') : [],
            userId: userId,
            offsetEpisodes: offsetEpisodes,
            limitEpisodes: limitEpisodes
        });
        this.sendSuccess(response, star);
    } catch (e) {
        console.error(e);
        this.sendServerError(response, {
            error: 'Error getting star'
        })
    }
}

Controller.prototype.getStarByIdSirqul = async function(request, response) {
    let id = request.params.id,
        userId = request.query.userid,
        offsetEpisodes = parseInt(request.query.offsetepisodes) || 0,
        limitEpisodes = parseInt(request.query.limitepisodes) || 20;

    if (userId && !this.isAuthenticatedUser(request, userId)) {
        userId = undefined;
    }

    try {
        let star = await starService.getStarByIdSirqul(id, {
            fields: request.query.fields ? request.query.fields.split(',') : [],
            userId: userId,
            offsetEpisodes: offsetEpisodes,
            limitEpisodes: limitEpisodes
        });
        this.sendSuccess(response, star);
    } catch (e) {
        console.error(e);
        this.sendServerError(response, {
            error: 'Error getting star'
        })
    }
};

module.exports = Controller;