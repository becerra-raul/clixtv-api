let util = require('util'),
    BaseController = require('./base-controller'),
    seriesService = require('../services/series-service');

function Controller(app) {
    if (!(this instanceof Controller)) {
        return new Controller(app);
    }
    BaseController.call(this, app, {
        path: '/series'
    });
}

util.inherits(Controller, BaseController);

Controller.prototype.registerAllMethods = function() {

    /**
     * @api {get} /series/slug/:slug/episodes Get series episodes
     * @apiName GetEpisodesBySeriesSlug
     * @apiGroup Series
     * @apiVersion 2.0.0
     *
     * @apiDescription Returns the episodes for the provided series slug
     *
     * @apiParam {String} slug Series slug
     * @apiParam {Number} [offset = 0] Number of episodes to offset
     * @apiParam {Number} [limit = 20] Total number of episodes to return
     * @apiParam {String} [userid] User ID
     *
     * @apiExample {curl} Example Usage
     *                  curl -i https://api.clixtv.com/v2.0/series/slug/spearos/episodes
     *
     * @apiUse EpisodeListResponseModel
     *
     * @apiError {String} error Error message if no series was found.
     */
    this.registerGetMethod('/slug/:slug/episodes', this.getEpisodesBySeriesSlug);
    this.registerGetMethod('/sirqul/slug/:slug/episodes', this.getEpisodesBySeriesSlugSirqul);
};

Controller.prototype.getEpisodesBySeriesSlug = async function(request, response) {
    let slug = request.params.slug,
        offset = parseInt(request.query.offset) || 0,
        limit = parseInt(request.query.limit) || 20,
        userId = request.query.userid;

    // if (userId && !this.isAuthenticatedUser(request, userId)) {
    //     userId = undefined;
    // }

    try {
        let series = await seriesService.getEpisodesBySeriesSlug(slug, {
            offset: offset,
            limit: limit,
            userId: userId
        });
        this.sendSuccess(response, series);
    } catch (e) {
        console.error(e);
        this.sendServerError(response, {
            error: 'Error getting episodes'
        })
    }
};

Controller.prototype.getEpisodesBySeriesSlugSirqul = async function(request, response) {
    let slug = request.params.slug,
        offset = parseInt(request.query.offset) || 0,
        limit = parseInt(request.query.limit) || 20,
        userId = request.query.userid,
        orderAudienceId = request.query.orderAudienceId;

    // if (userId && !this.isAuthenticatedUser(request, userId)) {
    //     userId = undefined;
    // }

    try {
        let series = await seriesService.getEpisodesBySeriesSlugSirqul(slug, {
            offset: offset,
            limit: limit,
            userId: userId,
            orderAudienceId
        });
        this.sendSuccess(response, series);
    } catch (e) {
        console.error(e);
        this.sendServerError(response, {
            error: 'Error getting episodes'
        })
    }
};

module.exports = Controller;