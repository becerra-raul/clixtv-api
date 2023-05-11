let slugService = require('./slug-service'),
    proxyService = require('./proxy-service'),
    mediaService = require('./media-service'),
    episodeService = require('./episode-service'),
    sirqulService = require('./sirqul-service'),
    episodePopulationService = require('./episode-population-service'),
    favoriteDao = require('../persistence/favorite-dao'),
    categoryDao = require('../persistence/category-dao'),
    episodeDao = require('../persistence/episode-dao'),
    entityTypeEnum = require('../models/enum/entity-type-enum'),
    parameterTypeEnum = require('../models/enum/parameter-type-enum'),
    orderUtils = require('../utils/order-utils'),
    requestPromise = require("request-promise-native");
NotFoundErrorModel = require('../models/not-found-error-model'),
    InvalidRequestErrorModel = require('../models/invalid-request-error-model'),
    DuplicateEntryErrorModel = require('../models/duplicate-entry-error-model'),
    CategoryListResponseModel = require('../models/response/category-list-response-model'),
    CategoryResponseModel = require('../models/response/category-response-model'),
    EpisodeListResponseModel = require('../models/response/episode-list-response-model'),
    CategoryRequestModel = require('../models/request/category-request-model'),

    apiUtils = require("../utils/api-utils"),
    sirqulProdConfigs = apiUtils.getSirqulProdConfig(),
    CacheBase = require('cache-base');

const app = new CacheBase();

const indexService = require('./index-service');
const commonService = require('./common-service');

const entityType = "category";

function Service() { }

function _suffleOrder(categoryEpisodes) {
    let j;
    let x;

    for (let i = categoryEpisodes.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = categoryEpisodes[i];
        categoryEpisodes[i] = categoryEpisodes[j];
        categoryEpisodes[j] = x;
    }
    return categoryEpisodes;
}

function _sort(category, categoryEpisodes) {
    categoryEpisodes.sort((a, b) => {
        const orderValueA = orderUtils.getEpisodeOrderInCategory(a, category.id)
        const orderValueB = orderUtils.getEpisodeOrderInCategory(b, category.id)
 
        return orderValueA - orderValueB
    })
}

function _sortOrderCategory(category, categoryEpisodes) {
    if (category.title === 'Recently Added') {
        categoryEpisodes.sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
        })
        _sort(category, categoryEpisodes);
    } else {
        if (category.random) {
            _suffleOrder(categoryEpisodes);
        }
        _sort(category, categoryEpisodes);
    }
}

/**
 * Returns the provided list of categories with their requested fields populated
 *
 * @private
 * @param {Object[]} categories List of categories to populate
 * @param {String[]} [fields] Fields to populate
 * @param {Object} [parameters] Parameters used for population
 * @returns {Promise<Object[]>}
 */
async function _getPopulatedCategories(categories = [], fields, parameters) {

    if (!categories || categories.length === 0) {
        return [];
    }

    const episodeIds = [];
    const starIds = [];

    const categoryIds = categories.map((category) => {
        category.episodes.episodes.forEach(({ id, star }) => {
            if (!episodeIds.includes(id)) {
                episodeIds.push(id);
            }
            if (star && !starIds.includes(star.id)) {
                starIds.push(star.id);
            }
        });
        return category.id;
    });

    const data = await Promise.all(
        [
            (categoryIds.length > 0) && favoriteDao.getUserFavoritesByIdsAndType(
                parameters[parameterTypeEnum.types.USERID.key],
                categoryIds,
                entityTypeEnum.types.CATEGORY
            ),
            (episodeIds.length > 0) && favoriteDao.getUserFavoritesByIdsAndType(
                parameters[parameterTypeEnum.types.USERID.key],
                episodeIds,
                entityTypeEnum.types.EPISODE
            ),
            (starIds.length > 0) && favoriteDao.getUserFavoritesByIdsAndType(
                parameters[parameterTypeEnum.types.USERID.key],
                starIds,
                entityTypeEnum.types.STAR
            )
        ]
    );

    const favoriteCategories = data[0];
    const favoriteEpisodes = data[1];
    const favoriteStars = data[2];

    categories.forEach((category) => {
        if (favoriteCategories) {
            category.isFavorite = favoriteCategories.filter(favorite => favorite.entity_id === category.id).length > 0;
        }
        if (favoriteEpisodes) {
            category.episodes.episodes.forEach((episode) => {
                episode.isFavorite = favoriteEpisodes.filter(favorite => favorite.entity_id === episode.id).length > 0;
                if (favoriteStars && episode.star) {
                    episode.star.isFavorite = favoriteStars.filter(favorite => favorite.entity_id === episode.star.id).length > 0;
                }
            });
        }
    });

    return categories;
}

/**
 * Returns the provided category with its requested fields populated
 *
 * @private
 * @param {Object} category Category to populate
 * @param {String[]} [fields] Fields to populate
 * @param {Object} [parameters] Parameters used for population
 * @returns {Promise<Object>}
 */
async function _getPopulatedCategory(category, fields, parameters) {
    let categories = await _getPopulatedCategories([category], fields, parameters);
    return categories[0];
}

const getCategoryByProperty = async (key, value, parameters) => {
    const { total, categories } = await indexService.searchData(null, {
        types: ['category'],
        filters: [
            {
                fields: [key],
                query: value
            }
        ]
    });
    if (total === 0) {
        throw new NotFoundErrorModel(`No category found matching ${key} ${value}`);
    }
    const category = categories[0];
    const { episodes } = await indexService.searchData('*', {types: ['episode']}, 0, 9999,
    [
        { order: { order: 'asc', missing: "_last", unmapped_type: "long" } },
        { 'series.slug.keyword': { order: "asc", missing: "_last", unmapped_type: "string" } },
        { 'episodeNumber': { order: "asc", missing: "_last", unmapped_type: "long" } },
    ]);

    const categoryEpisodes = episodes.filter((episode) => {
        return episode.categoryIds.includes(category.id);
    });

    _sortOrderCategory(category, categoryEpisodes);

    category.episodes = new EpisodeListResponseModel(categoryEpisodes.length, categoryEpisodes);
    const populatedCategory = await _getPopulatedCategory(category, [], {
        [parameterTypeEnum.types.USERID.key]: parameters.userId
    });
    return new CategoryResponseModel(populatedCategory);
};

/**
 * Adds a new category
 *
 * @public
 * @param {CategoryRequestModel} model Request model
 * @returns {Promise.<CategoryResponseModel>} Response model
 * @throws DuplicateEntryErrorModel if a category already exists with that slug
 */
Service.prototype.addCategory = async function (model) {
    if (!(model instanceof CategoryRequestModel)) {
        throw new InvalidRequestErrorModel('Request model to add category must be instance of CategoryRequestModel');
    }
    try {
        let insertResponse = await categoryDao.addCategory(model.title, model.slug, new Date()),
            category = await categoryDao.getCategoryById(insertResponse.insertId);
        category = await _getPopulatedCategory(category, [entityTypeEnum.types.MEDIA]);
        return new CategoryResponseModel(category);
    } catch (e) {
        if (e.code === 'ER_DUP_ENTRY') {
            throw new DuplicateEntryErrorModel('A category with that slug already exists');
        }
        throw e;
    }
};

/**
 * Updates a category with the provided ID
 *
 * @public
 * @param {Number} id Category ID
 * @param {CategoryRequestModel} model Request model
 * @returns {Promise.<CategoryResponseModel>} Response model
 * @throws DuplicateEntryErrorModel if a category already exists with that slug
 */
Service.prototype.updateCategoryById = async function (id, model) {
    if (!(model instanceof CategoryRequestModel)) {
        throw new InvalidRequestErrorModel('Request model to update category must be instance of CategoryRequestModel');
    }
    let category = await categoryDao.getCategoryById(id);
    if (!category) {
        throw new NotFoundErrorModel('No category found matching ID ' + id);
    }

    try {
        let updateModel = Object.assign({}, category, model);

        delete updateModel.id;
        delete updateModel.updated_date;
        delete updateModel.created_date;

        await categoryDao.updateCategoryById(id, updateModel);
        return await this.getCategoryById(id);
    } catch (e) {
        if (e.code === 'ER_DUP_ENTRY') {
            throw new DuplicateEntryErrorModel('A category with that slug already exists');
        }
        throw e;
    }
};

/**
 * Returns the list of categories
 *
 * @public
 * @param {Number} [offset=0] Number to offset list of categories
 * @param {Number} [limit=20] Total number of categories to return
 * @param parameters
 * @returns {Promise.<CategoryListResponseModel>}
 */
Service.prototype.getCategories = async function (offset = 0, limit = 20, parameters = {}) {
    const data = await Promise.all(
        [
            indexService.searchData('*', { types: ['category'] }, offset, limit,
                [{ order: { order: 'asc', missing: "_last", unmapped_type: "long" } },
                { 'slug.keyword': { order: "asc", missing: "_last", unmapped_type: "string" } },
                ]),
            indexService.searchData('*', { types: ['episode'] }, 0, 9999,
                [
                    { order: { order: 'asc', missing: "_last", unmapped_type: "long" } },
                    { 'series.slug.keyword': { order: "asc", missing: "_last", unmapped_type: "string" } },
                    { 'episodeNumber': { order: "asc", missing: "_last", unmapped_type: "long" } },
                ]
            ),
        ]
    );
    const { total, categories } = data[0];
    const { episodes } = data[1];

    (categories || []).forEach((category) => {
        const categoryEpisodes = (episodes || []).filter((episode) => {
            return episode.categoryIds.includes(category.id);
        });

        _sortOrderCategory(category, categoryEpisodes);


        category.episodes = new EpisodeListResponseModel(categoryEpisodes.length, categoryEpisodes);
    });

    const populatedCategories = await _getPopulatedCategories(categories, [], {
        [parameterTypeEnum.types.USERID.key]: parameters.userId
    });

    return new CategoryListResponseModel(total, populatedCategories);
};

/**
 * Returns the category matching the provided slug
 *
 * @public
 * @param {String} slug Category slug
 * @param parameters
 * @returns {Promise.<CategoryResponseModel>}
 * @throws NotFoundErrorModel if no category was found
 */
Service.prototype.getCategoryBySlug = async function (slug, parameters) {
    return getCategoryByProperty('slug', slug, parameters);
};

/**
 * Returns the category matching the provided ID
 *
 * @public
 * @param {Number} id Category ID
 * @param parameters
 * @returns {Promise.<CategoryResponseModel>}
 * @throws NotFoundErrorModel if no category was found
 */
Service.prototype.getCategoryById = async function (id, parameters) {
    return getCategoryByProperty('id', id, parameters);
};

/**
 * Returns the categories matching the provided IDs
 *
 * @public
 * @param {Number[]} ids Category IDs
 * @param parameters
 * @returns {Promise.<CategoryListResponseModel[]>}
 */
Service.prototype.getCategoriesByIds = async function (ids, parameters = {}) {
    const { total, categories } = await indexService.searchData(
        undefined,
        {
            types: ['category'],
            filters: [
                {
                    fields: ['id'],
                    query: ids.join(' OR ')
                }
            ]
        }
    );

    const populatedCategories = await _getPopulatedCategories(categories, [], {
        [parameterTypeEnum.types.USERID.key]: parameters.userId
    });

    return new CategoryListResponseModel(total, populatedCategories);
};

/**
 * Returns the list of categories
 *
 * @public
 * @param {Number} [offset=0] Number to offset list of categories
 * @param {Number} [limit=20] Total number of categories to return
 * @param parameters
 * @returns {Promise.<CategoryListResponseModel>}
 */
Service.prototype.getCategoriesSirqul = async function (offset = 0, limit = 20, parameters = {}) {

    let self = this;
    const appConfig = await sirqulService.getAppConfig();
    const categorySettings = appConfig.homeview.categories.sort((a, b) => (a.order - b.order));
    let filteredCategories = [];
    if (parameters.keyword) {
        filteredCategories = categorySettings.filter(cat => cat.title.search(new RegExp('(' + parameters.keyword + ')', 'i')) > -1)
        parameters.keyword = undefined;
    } else {
        filteredCategories = categorySettings;
    }
    // get sirqul categories
    filteredCategories.sort((a, b) => a.order - b.order);
    let ps = [];
    let count = 0;
    filteredCategories.forEach((catSetting) => {
        //pagination
        if (count >= offset && count < (offset + limit)) {
            let id = catSetting.albums[0];
            p = sirqulService.getEntityById(entityType, id, parameters);
            ps.push(p);
        }
        count++;
    });
    const categories = await Promise.all(ps)
    if (categories) {
        return new CategoryListResponseModel(categories.length, categories, true);
    }
};

/**
 * Returns the category matching the provided ID (SIRQUL)
 *
 * @public
 * @param {Number} id Category ID
 * @param parameters
 * @returns {Promise.<CategoryResponseModel>}
 * @throws NotFoundErrorModel if no category was found
 */
Service.prototype.getCategoryByIdSirqul = async function (id, parameters) {
    let self = this;

    return sirqulService.getEntityById(entityType, id, parameters)
        .then((data) => {
            if (data) {
                let result = new CategoryResponseModel(data, true);
                return result;
            }
            return null;
        });
};

Service.prototype.getCategoryBySlugSirqul = async function (slug, parameters) {
    let episodeRes;
    if (!parameters.offsetEpisodes) {
        const appConfig = await sirqulService.getAppConfig();
        const categorySettings = appConfig.homeview.categories.sort((a, b) => (a.order - b.order));
        const catSetting = categorySettings.find(cat => cat.slug == slug);
        if (catSetting) {
            if (catSetting.staticFile) {
                const textRes = await commonService.getURLResponse(catSetting.staticFile);
                if (textRes) {
                    episodeRes = JSON.parse(textRes)
                    parameters.fields = parameters.fields.filter(f => f !== 'episodes');
                }
            }
        }
    }
    return sirqulService.getEntityBySlug(entityType, slug, parameters)
        .then((data) => {
            if (data) {
                if (episodeRes) {
                    const episodes = new EpisodeListResponseModel(episodeRes.countTotal, episodeRes.items, true);
                    data.episodes = episodes;
                }
                let result = new CategoryResponseModel(data, true);
                return result;
            }
            return null;
        });
};

Service.prototype.getCategoryEpisodesSirqul = async function (id, catSettings, parameters){
    //pagination
    let params = {};
    if(catSettings.albumTypes) params['albumType'] = catSettings.albumTypes.join(",");
    if(catSettings.categories) params['categoryIds'] = id;
    if(catSettings.audiences) params['audienceIds'] = catSettings.audiences.join(",");
    if(catSettings.filters) params['filters'] = catSettings.filters.join(",");
    //TODO: need a separate endpoint to get episodes or set predefined number of episodes per row
    //TODO: sort order of the episodes in some order since _sortOrderCategory can't be reused
    // clix is getting all episodes at the moment, so doing the same
    params['start'] = parameters.offsetEpisodes || 0;
    params['limit'] = parameters.limitEpisodes || 10;
    // TODO: use accountId once authorization is done
    // params['accountId'] = parameters.userId || null
    params.categoryFilterIds = parseInt(sirqulProdConfigs.appConfigVersion || 0) || undefined;
    return sirqulService.makePostRequestPromise(
        "album/search",
        params,
        true,
        true)
        .then((data) => {
            let albumSearchResponse = data;
            if (albumSearchResponse.valid && albumSearchResponse.items) {
                return new EpisodeListResponseModel(albumSearchResponse.countTotal, albumSearchResponse.items, true);
            } else {
                return null;
            }
        });
}

module.exports = new Service();