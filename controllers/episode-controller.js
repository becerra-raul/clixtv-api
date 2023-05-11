let util = require('util'),
    BaseController = require('./base-controller'),
    episodeService = require('../services/episode-service');

function Controller(app) {
    if (!(this instanceof Controller)) {
        return new Controller(app);
    }
    BaseController.call(this, app, {
        path: '/episodes'
    });
}

util.inherits(Controller, BaseController);

Controller.prototype.registerAllMethods = function() {

    /**
     * @api {get} /episodes/slug/:slug Get episode by slug
     * @apiName GetEpisodeBySlug
     * @apiGroup Episodes
     * @apiVersion 2.0.0
     *
     * @apiDescription Looks up a episode matching the provided slug.
     *
     * @apiParam {String} slug Episode slug
     * @apiParam {String} [userid] User ID
     *
     * @apiExample {curl} Example Usage
     *                  curl -i https://api.clixtv.com/v2.0/episodes/slug/sock-it-to-ya-party-socks
     *
     * @apiUse EpisodeResponseModel
     *
     * @apiError {String} error Error message if no episode was found.
     */
    this.registerGetMethod('/slug/:slug', this.getEpisodeBySlug);
    this.registerGetMethod('/sirqul/slug/:slug', this.getEpisodeBySlugSirqul);


    /**
     * @api {get} /episodes/id/:id Get episode by ID
     * @apiName GetEpisodeById
     * @apiGroup Episodes
     * @apiVersion 2.0.0
     *
     * @apiDescription Looks up a episode matching the provided ID.
     *
     * @apiParam {String} id Episode ID
     * @apiParam {String} [userid] User ID
     *
     * @apiExample {curl} Example Usage
     *                  curl -i https://api.clixtv.com/v2.0/episodes/id/591112e12bbc15029759c977
     *
     * @apiUse EpisodeResponseModel
     *
     * @apiError {String} error Error message if no episode was found.
     */
    this.registerGetMethod('/id/:id', this.getEpisodeById);
    this.registerGetMethod('/sirqul/id/:id', this.getEpisodeByIdSirqul);

    /**
     * @api {get} /episodes/slug/:slug/related Get related episodes
     * @apiName GetRelatedEpisodesByEpisodeSlug
     * @apiGroup Episodes
     * @apiVersion 2.0.0
     *
     * @apiDescription Returns the related episodes for the episode matching the provided slug.
     *
     * @apiParam {String} slug Episode slug
     * @apiParam {Number} [offset = 0] Number of episodes to offset
     * @apiParam {Number} [limit = 20] Total number of episodes to return
     * @apiParam {String} [userid] User ID
     *
     * @apiExample {curl} Example Usage
     *                  curl -i https://api.clixtv.com/v2.0/episodes/slug/sock-it-to-ya-party-socks/related?offset=0&limit=20
     *
     * @apiUse EpisodeListResponseModel
     *
     * @apiError {String} error Error message if no episode was found.
     */
    this.registerGetMethod('/slug/:slug/related', this.getRelatedEpisodesByEpisodeSlug);
    this.registerGetMethod('/sirqul/slug/:slug/related', this.getRelatedEpisodesByEpisodeSlugSirqul);

    this.registerGetMethod('/', this.getEpisodes);
};

Controller.prototype.getEpisodeBySlug = async function(request, response) {
    let slug = request.params.slug,
        userId = request.query.userid;

    if (userId && !this.isAuthenticatedUser(request, userId)) {
        userId = undefined;
    }

    try {
        let episode = await episodeService.getEpisodeBySlug(slug, {
            userId: userId
        });
        this.sendSuccess(response, episode);
    } catch (e) {
        console.error(e);
        this.sendServerError(response, {
            error: 'Error getting episode'
        })
    }
};

Controller.prototype.getEpisodeById = async function(request, response) {
    let id = request.params.id,
        userId = request.query.userid;

    if (userId && !this.isAuthenticatedUser(request, userId)) {
        userId = undefined;
    }

    try {
        let episode = await episodeService.getEpisodeById(id, {
            userId: userId
        });
        this.sendSuccess(response, episode);
    } catch (e) {
        console.error(e);
        this.sendServerError(response, {
            error: 'Error getting episode'
        })
    }
};

Controller.prototype.getRelatedEpisodesByEpisodeSlug = async function(request, response) {
    let slug = request.params.slug,
        offset = parseInt(request.query.offset) || 0,
        limit = parseInt(request.query.limit) || 20,
        userId = request.query.userid;

    if (userId && !this.isAuthenticatedUser(request, userId)) {
        userId = undefined;
    }

    try {
        let episode = await episodeService.getRelatedEpisodesByEpisodeSlug(slug, {
            offset: offset,
            limit: limit,
            userId: userId
        });
        this.sendSuccess(response, episode);
    } catch (e) {
        console.error(e);
        this.sendServerError(response, {
            error: 'Error getting related episodes'
        })
    }
};

Controller.prototype.getEpisodes = async function(request, response) {
    const offset = parseInt(request.query.offset) || 0;
    const limit = parseInt(request.query.limit) || 20;
    let userId = request.query.userid;

    if (userId && !this.isAuthenticatedUser(request, userId)) {
        userId = undefined;
    }

    try {
        const episodes = await episodeService.getEpisodes({
            offset: offset,
            limit: limit,
            userId: userId
        });
        this.sendSuccess(response, episodes);
    } catch (e) {
        console.error(e);
        this.sendServerError(response, {
            error: 'Error getting episodes'
        })
    }
};

Controller.prototype.getEpisodeBySlugSirqul = async function(request, response){
    let slug = request.params.slug,
        userId = request.query.userid;

    if (userId && !this.isAuthenticatedUser(request, userId)) {
        userId = undefined;
    }

    try {
        let episode = await episodeService.getEpisodeBySlugSirqul(slug, {
            userId: userId
        });
        this.sendSuccess(response, episode);
    } catch (e) {
        console.error(e);
        this.sendServerError(response, {
            error: 'Error getting episode'
        })
    }
}

Controller.prototype.getEpisodeByIdSirqul = async function(request, response) {
    let id = request.params.id,
        userId = request.query.userid;

    if (userId && !this.isAuthenticatedUser(request, userId)) {
        userId = undefined;
    }

    try {
        let episode = await episodeService.getEpisodeByIdSirqul(id, {
            userId: userId
        });
        this.sendSuccess(response, episode);
    } catch (e) {
        console.error(e);
        this.sendServerError(response, {
            error: 'Error getting episode'
        })
    }
};

Controller.prototype.getRelatedEpisodesByEpisodeSlugSirqul = async function(request, response) {
    let slug = request.params.slug,
        offset = parseInt(request.query.offset) || 0,
        limit = parseInt(request.query.limit) || 20,
        userId = request.query.userid;

    if (userId && !this.isAuthenticatedUser(request, userId)) {
        userId = undefined;
    }

    try {
        let episode = await episodeService.getRelatedEpisodesByEpisodeSlugSirqul(slug, {
            offset: offset,
            limit: limit,
            userId: userId
        });
        this.sendSuccess(response, episode);
    } catch (e) {
        console.error(e);
        this.sendServerError(response, {
            error: 'Error getting related episodes'
        })
    }
};

module.exports = Controller;