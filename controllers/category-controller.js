let util = require('util'),
    BaseController = require('./base-controller'),
    categoryService = require('../services/category-service'),
    CategoryRequestModel = require('../models/request/category-request-model'),
    DuplicateEntryErrorModel = require('../models/duplicate-entry-error-model'),
    NotFoundErrorModel = require('../models/not-found-error-model');

function Controller(app) {
    if (!(this instanceof Controller)) {
        return new Controller(app);
    }
    BaseController.call(this, app, {
        path: '/categories'
    });
}

util.inherits(Controller, BaseController);

Controller.prototype.registerAllMethods = function() {

    /**
     * @api {get} /categories Get categories
     * @apiName GetCategories
     * @apiGroup Categories
     * @apiVersion 2.0.0
     *
     * @apiDescription Returns all categories
     *
     * @apiParam {Number} [offset = 0] Number of categories to offset
     * @apiParam {Number} [limit = 20] Total number of categories to return
     * @apiParam {Number} [offsetepisodes = 0] Number of episodes to offset
     * @apiParam {Number} [limitepisodes = 20] Total number of episodes to return
     * @apiParam {String} [fields] Comma delimited list of additional fields to return (Ex. "episodes")
     * @apiParam {String} [userid] User ID
     *
     * @apiExample {curl} Example Usage
     *                  curl -i https://api.clixtv.com/v2.0/categories?offset=0&limit=20
     *
     * @apiSuccess {Object} success List of categories
     *
     * @apiError {String} error Error message if no categories were found
     */
    this.registerGetMethod('/', this.getCategories);
    this.registerGetMethod('/sirqul', this.getCategoriesSirqul);

    /**
     * @api {get} /categories/slug/:slug Get category by slug
     * @apiName GetCategoryBySlug
     * @apiGroup Categories
     * @apiVersion 2.0.0
     *
     * @apiDescription Looks up a category matching the provided slug.
     *
     * @apiParam {String} slug Category slug
     * @apiParam {Number} [offsetepisodes = 0] Number of episodes to offset
     * @apiParam {Number} [limitepisodes = 20] Total number of episodes to return
     * @apiParam {String} [userid] User ID
     *
     * @apiExample {curl} Example usage:
     *                  curl -i https://api.clixtv.com/v2.0/categories/slug/trending-now?offsetepisodes=0&limitepisodes=20
     *
     * @apiSuccess {Object} success Category object
     *
     * @apiError {String} error Error message if no category was found.
     */
    this.registerGetMethod('/slug/:slug', this.getCategoryBySlug);
    // for sirqul, category get by slug is the same as is id
    this.registerGetMethod('/sirqul/slug/:slug', this.getCategoryBySlugSirqul);

    /**
     * @api {get} /categories/id/:id Get category by ID
     * @apiName GetCategoryById
     * @apiGroup Categories
     * @apiVersion 2.0.0
     *
     * @apiDescription Looks up a category matching the provided ID.
     *
     * @apiParam {String} id Category ID
     * @apiParam {Number} [offsetepisodes = 0] Number of episodes to offset
     * @apiParam {Number} [limitepisodes = 20] Total number of episodes to return
     * @apiParam {String} [userid] User ID
     *
     * @apiExample {curl} Example usage:
     *                  curl -i https://api.clixtv.com/v2.0/categories/id/57d1a8fd60130003003b727b?offsetepisodes=0&limitepisodes=20
     *
     * @apiSuccess {Object} success Category object
     *
     * @apiError {String} error Error message if no category was found.
     */
    this.registerGetMethod('/id/:id', this.getCategoryById);
    this.registerGetMethod('/sirqul/id/:id', this.getCategoryByIdSirqul);

    this.registerPostMethod('/', this.addCategory);

    this.registerPutMethod('/id/:id', this.updateCategoryById);
};

Controller.prototype.getCategories = async function(request, response) {
    let offset = parseInt(request.query.offset) || 0,
        limit = parseInt(request.query.limit) || 20,
        offsetEpisodes = parseInt(request.query.offsetepisodes) || 0,
        limitEpisodes = parseInt(request.query.limitepisodes) || 20,
        userId = request.query.userid;

    if (userId && !this.isAuthenticatedUser(request, userId)) {
        userId = undefined;
    }

    try {
        let categories = await categoryService.getCategories(offset, limit, {
            fields: request.query.fields ? request.query.fields.split(',') : [],
            offsetEpisodes: offsetEpisodes,
            limitEpisodes: limitEpisodes,
            userId: userId,
            keyword: request.query.keyword,
            sortField: request.query.sortField
        });
        this.sendSuccess(response, categories);
    } catch (e) {
        console.error(e);
        this.sendServerError(response, {
            error: 'Error getting categories'
        })
    }
};

Controller.prototype.getCategoryBySlug = async function(request, response) {
    let slug = request.params.slug,
        offsetEpisodes = parseInt(request.query.offsetepisodes) || 0,
        limitEpisodes = parseInt(request.query.limitepisodes) || 20,
        userId = request.query.userid;

    if (userId && !this.isAuthenticatedUser(request, userId)) {
        userId = undefined;
    }

    try {
        let category = await categoryService.getCategoryBySlug(slug, {
            offsetEpisodes: offsetEpisodes,
            limitEpisodes: limitEpisodes,
            userId: userId
        });
        this.sendSuccess(response, category);
    } catch (e) {
        console.error(e);
        this.sendServerError(response, {
            error: 'Error getting category'
        })
    }
};

Controller.prototype.getCategoryById = async function(request, response) {
    let id = request.params.id,
        offsetEpisodes = parseInt(request.query.offsetepisodes) || 0,
        limitEpisodes = parseInt(request.query.limitepisodes) || 20,
        userId = request.query.userid;

    if (userId && !this.isAuthenticatedUser(request, userId)) {
        userId = undefined;
    }

    try {
        let category = await categoryService.getCategoryById(id, {
            offsetEpisodes: offsetEpisodes,
            limitEpisodes: limitEpisodes,
            userId: userId
        });
        this.sendSuccess(response, category);
    } catch (e) {
        console.error(e);
        this.sendServerError(response, {
            error: 'Error getting category'
        })
    }
};

Controller.prototype.addCategory = async function(request, response) {
    // if (request.accessLevels.indexOf('ADMIN') === -1) {
    //     this.sendForbiddenError(response, {
    //         error: 'Invalid permissions to add category'
    //     });
    //     return new Promise(() => {});
    // }

    let model = new CategoryRequestModel(request.body),
        errorMessage = model.getErrorMessage();

    if (errorMessage) {
        this.sendBadRequestError(response, {
            error: errorMessage
        });
        return new Promise(() => {});
    }

    try {
        let category = await categoryService.addCategory(model);
        this.sendSuccess(response, category);
    } catch (e) {
        console.error(e);
        if (e instanceof DuplicateEntryErrorModel) {
            this.sendBadRequestError(response, {
                error: e.message
            });
        } else {
            this.sendServerError(response, {
                error: 'Error adding category'
            });
        }
    }
};

Controller.prototype.updateCategoryById = async function(request, response) {
    // if (request.accessLevels.indexOf('ADMIN') === -1) {
    //     this.sendForbiddenError(response, {
    //         error: 'Invalid permissions to update category'
    //     });
    //     return new Promise(() => {});
    // }

    let id = request.params.id,
        model = new CategoryRequestModel(request.body);

    try {
        let category = await categoryService.updateCategoryById(id, model);
        this.sendSuccess(response, category);
    } catch (e) {
        console.error(e);
        if ((e instanceof DuplicateEntryErrorModel) || (e instanceof NotFoundErrorModel)) {
            this.sendBadRequestError(response, {
                error: e.message
            });
        } else {
            this.sendServerError(response, {
                error: 'Error updating category'
            });
        }
    }
};

Controller.prototype.getCategoriesSirqul = async function(request, response) {
    let offset = parseInt(request.query.offset) || 0,
        limit = parseInt(request.query.limit) || 20,
        offsetEpisodes = parseInt(request.query.offsetepisodes) || 0,
        limitEpisodes = parseInt(request.query.limitepisodes) || 10,
        userId = request.query.userid;

    if (userId && !this.isAuthenticatedUser(request, userId)) {
        userId = undefined;
    }

    try {
        let parameters = {
            fields: request.query.fields ? request.query.fields.split(',') : [],
            offsetEpisodes: offsetEpisodes,
            limitEpisodes: limitEpisodes,
            userId: userId,
            keyword: request.query.keyword,
            sortField: request.query.sortField
        };
        let categories = await categoryService.getCategoriesSirqul(offset, limit, parameters);
        this.sendSuccess(response, categories);
    } catch (e) {
        console.error(e);
        this.sendServerError(response, {
            error: 'Error getting categories'
        })
    }
}

Controller.prototype.getCategoryBySlugSirqul = async function(request, response) {
    let slug = request.params.slug,
        offsetEpisodes = parseInt(request.query.offsetepisodes) || 0,
        limitEpisodes = parseInt(request.query.limitepisodes) || 20,
        userId = request.query.userid;

    if (userId && !this.isAuthenticatedUser(request, userId)) {
        userId = undefined;
    }

    try {
        let category = await categoryService.getCategoryBySlugSirqul(slug, {
            fields: request.query.fields ? request.query.fields.split(',') : [],
            offsetEpisodes: offsetEpisodes,
            limitEpisodes: limitEpisodes,
            userId: userId
        });
        this.sendSuccess(response, category);
    } catch (e) {
        console.error(e);
        this.sendServerError(response, {
            error: 'Error getting category'
        })
    }
}

Controller.prototype.getCategoryByIdSirqul = async function(request, response) {
    let id = request.params.id,
        offsetEpisodes = parseInt(request.query.offsetepisodes) || 0,
        limitEpisodes = parseInt(request.query.limitepisodes) || 10,
        userId = request.query.userid;

    if (userId && !this.isAuthenticatedUser(request, userId)) {
        userId = undefined;
    }

    try {
        let category = await categoryService.getCategoryByIdSirqul(id, {
            fields: request.query.fields ? request.query.fields.split(',') : [],
            offsetEpisodes: offsetEpisodes,
            limitEpisodes: limitEpisodes,
            userId: userId
        });
        this.sendSuccess(response, category);
    } catch (e) {
        console.error(e);
        this.sendServerError(response, {
            error: 'Error getting category'
        })
    }
};

module.exports = Controller;