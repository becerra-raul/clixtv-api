let util = require('util'),
    BaseController = require('./base-controller'),
    favoriteService = require('../services/favorite-service'),
    entityTypeEnum = require('../models/enum/entity-type-enum'),
    FavoriteRequestModel = require('../models/request/favorite-request-model');

function Controller(app) {
    if (!(this instanceof Controller)) {
        return new Controller(app);
    }
    BaseController.call(this, app, {
        path: '/favorites'
    });
}

util.inherits(Controller, BaseController);

Controller.prototype.registerAllMethods = function() {

    /**
     * @api {get} /favorites/user/id/:userid/episodes Get favorite episodes
     * @apiName GetFavoriteEpisodes
     * @apiGroup Favorites
     * @apiVersion 2.0.0
     *
     * @apiDescription Returns the favorite episodes for the provided user ID
     *
     * @apiHeader {String="Bearer :token"} Authorization Replace <code>:token</code> with supplied Auth Token
     *
     * @apiParam {String} userid User ID
     * @apiParam {Number} [offset = 0] Number of episodes to offset
     * @apiParam {Number} [limit = 20] Total number of episodes to return
     *
     * @apiExample {curl} Example Usage
     *                  curl -i https://api.clixtv.com/v2.0/favorites/user/id/17/episodes?offset=0&limit=20
     *
     * @apiUse EpisodeListResponseModel
     *
     * @apiError {String} error Error message if user is not authorized to view favorites.
     */
    this.registerGetMethod('/user/id/:userid/episodes', this.getFavoriteEpisodes);

    /**
     * @api {get} /favorites/user/id/:userid/offers Get favorite offers
     * @apiName GetFavoriteOffers
     * @apiGroup Favorites
     * @apiVersion 2.0.0
     *
     * @apiDescription Returns the favorite offers for the provided user ID
     *
     * @apiHeader {String="Bearer :token"} Authorization Replace <code>:token</code> with supplied Auth Token
     *
     * @apiParam {String} userid User ID
     * @apiParam {Number} [offset = 0] Number of offers to offset
     * @apiParam {Number} [limit = 20] Total number of offers to return
     *
     * @apiExample {curl} Example Usage
     *                  curl -i https://api.clixtv.com/v2.0/favorites/user/id/17/offers?offset=0&limit=20
     *
     * @apiUse OfferListResponseModel
     *
     * @apiError {String} error Error message if user is not authorized to view favorites.
     */
    this.registerGetMethod('/user/id/:userid/offers', this.getFavoriteOffers);

    /**
     * @api {get} /favorites/user/id/:userid/brands Get favorite brands
     * @apiName GetFavoriteBrands
     * @apiGroup Favorites
     * @apiVersion 2.0.0
     *
     * @apiDescription Returns the favorite brands for the provided user ID
     *
     * @apiHeader {String="Bearer :token"} Authorization Replace <code>:token</code> with supplied Auth Token
     *
     * @apiParam {String} userid User ID
     * @apiParam {Number} [offset = 0] Number of brands to offset
     * @apiParam {Number} [limit = 20] Total number of brands to return
     *
     * @apiExample {curl} Example Usage
     *                  curl -i https://api.clixtv.com/v2.0/favorites/user/id/17/brands?offset=0&limit=20
     *
     * @apiUse BrandListResponseModel
     *
     * @apiError {String} error Error message if user is not authorized to view favorites.
     */
    this.registerGetMethod('/user/id/:userid/brands', this.getFavoriteBrands);

    /**
     * @api {get} /favorites/user/id/:userid/charities Get favorite charities
     * @apiName GetFavoriteCharities
     * @apiGroup Favorites
     * @apiVersion 2.0.0
     *
     * @apiDescription Returns the favorite charities for the provided user ID
     *
     * @apiHeader {String="Bearer :token"} Authorization Replace <code>:token</code> with supplied Auth Token
     *
     * @apiParam {String} userid User ID
     * @apiParam {Number} [offset = 0] Number of charities to offset
     * @apiParam {Number} [limit = 20] Total number of charities to return
     *
     * @apiExample {curl} Example Usage
     *                  curl -i https://api.clixtv.com/v2.0/favorites/user/id/17/charities?offset=0&limit=20
     *
     * @apiUse CharityListResponseModel
     *
     * @apiError {String} error Error message if user is not authorized to view favorites.
     */
    this.registerGetMethod('/user/id/:userid/charities', this.getFavoriteCharities);

    /**
     * @api {get} /favorites/user/id/:userid/stars Get favorite stars
     * @apiName GetFavoriteStars
     * @apiGroup Favorites
     * @apiVersion 2.0.0
     *
     * @apiDescription Returns the favorite stars for the provided user ID
     *
     * @apiHeader {String="Bearer :token"} Authorization Replace <code>:token</code> with supplied Auth Token
     *
     * @apiParam {String} userid User ID
     * @apiParam {Number} [offset = 0] Number of stars to offset
     * @apiParam {Number} [limit = 20] Total number of stars to return
     *
     * @apiExample {curl} Example Usage
     *                  curl -i https://api.clixtv.com/v2.0/favorites/user/id/17/stars?offset=0&limit=20
     *
     * @apiUse StarListResponseModel
     *
     * @apiError {String} error Error message if user is not authorized to view favorites.
     */
    this.registerGetMethod('/user/id/:userid/stars', this.getFavoriteStars);

    /**
     * @api {get} /favorites/user/id/:userid/categories Get favorite categories
     * @apiName GetFavoriteCategories
     * @apiGroup Favorites
     * @apiVersion 2.0.0
     *
     * @apiDescription Returns the favorite categories for the provided user ID
     *
     * @apiHeader {String="Bearer :token"} Authorization Replace <code>:token</code> with supplied Auth Token
     *
     * @apiParam {String} userid User ID
     * @apiParam {Number} [offset = 0] Number of categories to offset
     * @apiParam {Number} [limit = 20] Total number of categories to return
     *
     * @apiExample {curl} Example Usage
     *                  curl -i https://api.clixtv.com/v2.0/favorites/user/id/17/categories?offset=0&limit=20
     *
     * @apiUse CategoryListResponseModel
     *
     * @apiError {String} error Error message if user is not authorized to view favorites.
     */
    this.registerGetMethod('/user/id/:userid/categories', this.getFavoriteCategories);

    /**
     * @api {post} /favorites/:type Add favorite
     * @apiName PostFavorite
     * @apiGroup Favorites
     * @apiVersion 2.0.0
     *
     * @apiDescription Adds a favorite entity to the user's favorites list
     *
     * @apiHeader {String="Bearer :token"} Authorization Replace <code>:token</code> with supplied Auth Token
     *
     * @apiParam {String="episode","offer","brand","charity","star","category","episode_social"} type Entity type
     * @apiParam {String} userId User ID
     * @apiParam {String} entityId Entity ID
     *
     * @apiExample {js} Example usage:
     *                  {
     *                      userId: "17",
     *                      entityId: "150"
     *                  }
     *
     * @apiSuccess {Boolean} success True if the entity was added to the user's favorites
     *
     * @apiError {String} error Error message if the entity wasn't added to the user's favorites
     */
    this.registerPostMethod('/:type', this.addFavorite);

    /**
     * @api {delete} /favorites/:type Remove favorite
     * @apiName DeleteFavorite
     * @apiGroup Favorites
     * @apiVersion 2.0.0
     *
     * @apiDescription Removes an entity from the user's favorites list
     *
     * @apiHeader {String="Bearer :token"} Authorization Replace <code>:token</code> with supplied Auth Token
     *
     * @apiParam {String="episode","offer","brand","charity","star","category","episode_social"} type Entity type
     * @apiParam {String} userId User ID
     * @apiParam {String} entityId Episode ID
     *
     * @apiExample {js} Example usage:
     *                  {
     *                      userId: "17",
     *                      entityId: "150"
     *                  }
     *
     * @apiSuccess {Boolean} success True if the entity was removed from the user's favorites
     *
     * @apiError {String} error Error message if the entity wasn't removed from the user's favorites
     */
    this.registerDeleteMethod('/:type', this.removeFavorite);

    this.registerPostMethod('/', this.sirqulAddFavorite);
    this.registerDeleteMethod('/', this.sirqulRemoveFavorite);
    this.registerGetMethod('/', this.sirqulGetFavorites);
    this.registerGetMethod('/:id', this.sirqulGetFavorite);
};

async function _getFavorites(request, response, type) {
    let userId = request.params.userid,
        offset = parseInt(request.query.offset) || 0,
        limit = parseInt(request.query.limit) || 20;


    if (!this.isAuthenticatedUser(request, userId)) {
        this.sendForbiddenError(response, {
            error: 'Invalid permissions to get favorites'
        });
        return new Promise(() => {});
    }

    try {
        let favoriteResponse = await favoriteService.getFavorites(userId, type, offset, limit);
        this.sendSuccess(response, favoriteResponse);
    } catch (e) {
        console.error(e);
        this.sendServerError(response, {
            error: 'Error getting favorites'
        });
    }
}

Controller.prototype.addFavorite = async function(request, response) {
    let favoriteRequestModel = new FavoriteRequestModel(request.body);

    if (!this.isAuthenticatedUser(request, favoriteRequestModel.userId)) {
        this.sendForbiddenError(response, {
            error: 'Invalid permissions to add favorite'
        });
        return new Promise(() => {});
    }

    try {
        let favoriteResponse = await favoriteService.addFavorite(favoriteRequestModel.userId, favoriteRequestModel.entityId, entityTypeEnum.types[request.params.type.toUpperCase()]);
        this.sendSuccess(response, favoriteResponse);
    } catch (e) {
        console.error(e);
        this.sendServerError(response, {
            error: 'Error adding favorite'
        });
    }
};

Controller.prototype.removeFavorite = async function(request, response) {
    let favoriteRequestModel = new FavoriteRequestModel(request.body);

    if (!this.isAuthenticatedUser(request, favoriteRequestModel.userId)) {
        this.sendForbiddenError(response, {
            error: 'Invalid permissions to remove favorite'
        });
        return new Promise(() => {});
    }

    try {
        let favoriteResponse = await favoriteService.removeFavorite(favoriteRequestModel.userId, favoriteRequestModel.entityId, entityTypeEnum.types[request.params.type.toUpperCase()]);
        this.sendSuccess(response, favoriteResponse);
    } catch (e) {
        console.error(e);
        this.sendServerError(response, {
            error: 'Error removing favorite'
        });
    }
};

Controller.prototype.getFavoriteEpisodes = async function(request, response) {
    _getFavorites.call(this, request, response, entityTypeEnum.types.EPISODE);
};

Controller.prototype.getFavoriteOffers = async function(request, response) {
    _getFavorites.call(this, request, response, entityTypeEnum.types.OFFER);
};

Controller.prototype.getFavoriteBrands = async function(request, response) {
    _getFavorites.call(this, request, response, entityTypeEnum.types.BRAND);
};

Controller.prototype.getFavoriteCharities = async function(request, response) {
    _getFavorites.call(this, request, response, entityTypeEnum.types.CHARITY);
};

Controller.prototype.getFavoriteStars = async function(request, response) {
    _getFavorites.call(this, request, response, entityTypeEnum.types.STAR);
};

Controller.prototype.getFavoriteCategories = async function(request, response) {
    _getFavorites.call(this, request, response, entityTypeEnum.types.CATEGORY);
};

Controller.prototype.sirqulAddFavorite = function (request, response) {
    this.handleRequest(request, response, async () => {
        const currentUser = this.getSessionUser(request);
        const payload = { ...request.body, userId: currentUser.id };
        this.validatePayload(payload, ['favoritableId']);
        const result = await favoriteService.sirqulAddFavorite(payload);
        this.sendSuccess(response, result);
    });
};

Controller.prototype.sirqulRemoveFavorite = function (request, response) {
    this.handleRequest(request, response, async () => {
        const currentUser = this.getSessionUser(request);
        const payload = { ...request.body, userId: currentUser.id };
        this.validatePayload(payload, ['favoritableId']);
        const result = await favoriteService.sirqulRemoveFavorite(payload);
        this.sendSuccess(response, result);
    });
};

Controller.prototype.sirqulGetFavorites = function (request, response) {
    this.handleRequest(request, response, async () => {
        const currentUser = this.getSessionUser(request);
        const query = { ...request.query, userId: currentUser.id };
        this.validatePayload(query, ['userId']);
        const result = await favoriteService.sirqulGetFavorites(query);
        this.sendSuccess(response, result);
    })
};

Controller.prototype.sirqulGetFavorite = function (request, response) {
    this.handleRequest(request, response, async () => {
        const currentUser = this.getSessionUser(request);
        const query = { favoritableId: Number(request.params.id), userId: currentUser.id };
        this.validatePayload(query, ['userId', 'favoritableId']);
        const result = await favoriteService.sirqulGetFavorite(query);
        this.sendSuccess(response, result);
    })
};

module.exports = Controller;