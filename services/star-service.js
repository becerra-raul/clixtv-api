let slugService = require('./slug-service'),
    proxyService = require('./proxy-service'),
    mediaService = require('./media-service'),
    favoritesPopulationService = require('./favorites-population-service'),
    episodePopulationService = require('./episode-population-service'),
    sirqulService = require('./sirqul-service'),
    starDao = require('../persistence/star-dao'),
    episodeDao = require('../persistence/episode-dao'),
    seriesDao = require('../persistence/series-dao'),
    favoriteDao = require('../persistence/favorite-dao'),
    brandDao = require('../persistence/brand-dao'),
    offerDao = require('../persistence/offer-dao'),
    charityDao = require('../persistence/charity-dao'),
    entityTypeEnum = require('../models/enum/entity-type-enum'),
    parameterTypeEnum = require('../models/enum/parameter-type-enum'),
    NotFoundErrorModel = require('../models/not-found-error-model'),
    InvalidRequestErrorModel = require('../models/invalid-request-error-model'),
    DuplicateEntryErrorModel = require('../models/duplicate-entry-error-model'),
    StarResponseModel = require('../models/response/star-response-model'),
    StarListResponseModel = require('../models/response/star-list-response-model'),
    EpisodeListResponseModel = require('../models/response/episode-list-response-model'),
    SeriesListResponseModel = require('../models/response/series-list-response-model'),
    SeriesResponseModel = require('../models/response/series-response-model'),
    StarRequestModel = require('../models/request/star-request-model'),
    BrandListResponseModel = require('../models/response/brand-list-response-model'),
    CharityListResponseModel = require('../models/response/charity-list-response-model'),
    CharityResponseModel = require('../models/response/charity-response-model')

    sirqulProdConfigs = apiUtils.getSirqulProdConfig();

const indexService = require('./index-service');
const seriesService = require('./series-service');
const episodeService = require('./episode-service');
const entityType = "star";

function Service() { }

/**
 * Returns the provided list of stars with their requested fields populated
 *
 * @private
 * @param {Object[]} stars List of stars to populate
 * @param {String[]} [fields] Fields to populate
 * @param {Object} [parameters] Parameters used for population
 * @returns {Promise<Object[]>}
 */
async function _getPopulatedStars(stars, fields, parameters) {
    fields = fields || [];
    parameters = parameters || {};

    if (!stars || stars.length === 0) {
        return [];
    }

    return new Promise(async (resolve, reject) => {

        let series = [],
            brands = [],
            charities = [],
            offers = [];

        const brandIds = [];
        const charityIds = [];
        const episodeIds = [];

        let starIds = stars.map((star) => {
            if (star.brands) {
                star.brands.brands.forEach((brand) => {
                    if (!brandIds.includes(brand.id)) {
                        brandIds.push(brand.id);
                    }
                });
            }
            if (star.charities) {
                star.charities.charities.forEach((charity) => {
                    if (!charityIds.includes(charity.id)) {
                        charityIds.push(charity.id);
                    }
                });
            }
            if (star.episodes) {
                star.episodes.episodes.forEach((episode) => {
                    if (!episodeIds.includes(episode.id)) {
                        episodeIds.push(episode.id);
                    }
                });
            }
            return star.id;
        });

        const { episodes } = await episodeService.getEpisodesByIds(episodeIds, parameters);

        let favoriteStars = [],
            favoriteBrands = [],
            favoriteCharities = [],
            favoriteEpisodes = [];

        if (parameters[parameterTypeEnum.types.USERID.key]) {
            favoriteStars = await favoriteDao.getUserFavoritesByIdsAndType(parameters[parameterTypeEnum.types.USERID.key], starIds, entityTypeEnum.types.STAR);
            if (brandIds.length > 0) {
                favoriteBrands = await favoriteDao.getUserFavoritesByIdsAndType(parameters[parameterTypeEnum.types.USERID.key], brandIds, entityTypeEnum.types.BRAND);
            }
            if (charityIds.length > 0) {
                favoriteCharities = await favoriteDao.getUserFavoritesByIdsAndType(parameters[parameterTypeEnum.types.USERID.key], charityIds, entityTypeEnum.types.CHARITY);
            }
            if (episodeIds.length > 0) {
                favoriteEpisodes = await favoriteDao.getUserFavoritesByIdsAndType(parameters[parameterTypeEnum.types.USERID.key], episodeIds, entityTypeEnum.types.EPISODE);
            }
        }

        stars.forEach((star) => {

            if (parameters[parameterTypeEnum.types.USERID.key]) {
                star.isFavorite = (favoriteStars.filter((favorite) => (favorite.entity_id + '') === (star.id + '')).length > 0);
            }

            if (fields.indexOf(entityTypeEnum.types.SERIES) !== -1) {
                let starSeries = series[1].filter((s) => {
                    return (s.star + '') === (star.id + '');
                });

                if (episodes.length > 0) {
                    starSeries.forEach((s) => {
                        let seriesEpisodes = episodes[1].filter((episode) => {
                            return (episode.series.id + '') === (s.id + '');
                        });
                        let seriesBrands = brands.filter((brand) => {
                            return brand.series === s.id;
                        });
                        let seriesCharities = charities.filter((charity) => {
                            return charity.series === s.id;
                        });

                        s.episodes = new EpisodeListResponseModel(seriesEpisodes.length, seriesEpisodes);
                        s.brands = new BrandListResponseModel(seriesBrands.length, seriesBrands);
                        s.charity = new CharityResponseModel(seriesCharities[0]);
                    });
                }

                star.series = new SeriesListResponseModel(starSeries.length, starSeries);
            }

            if (star.brands) {
                star.brands.brands.forEach((brand) => {
                    brand.isFavorite = favoriteBrands.filter(favorite => favorite.entity_id === brand.id).length > 0;
                });
            }

            if (star.charities) {
                star.charities.charities.forEach((charity) => {
                    charity.isFavorite = favoriteCharities.filter(favorite => favorite.entity_id === charity.id).length > 0;
                });
            }

            if (star.episodes) {
                star.episodes.episodes.forEach((episode) => {
                    episode.isFavorite = favoriteEpisodes.filter(favorite => favorite.entity_id === episode.id).length > 0;
                });
            }

            if (star.series) {
                star.series.series.forEach((series) => {
                    (series.episodes || {}).episodes = ((series.episodes || {}).episodes || []).map(episode => {
                        return episodes.find(e => e.id === episode.id);
                    })
                });
            }
        });
        resolve(stars);
    })
}

/**
 * Returns the provided star with its requested fields populated
 *
 * @private
 * @param {Object} star Star to populate
 * @param {String[]} [fields] Fields to populate
 * @param {Object} [parameters] Parameters used for population
 * @returns {Promise<Object>}
 */
async function _getPopulatedStar(star, fields, parameters) {
    let stars = await _getPopulatedStars([star], fields, parameters);
    return stars[0];
}

const getStarByProperty = async (key, value, parameters = {}) => {
    const { total, stars } = await indexService.searchData(null, {
        types: ['star'],
        filters: [
            {
                fields: [key],
                query: value
            }
        ]
    });
    if (total === 0) {
        throw new NotFoundErrorModel(`No star found matching ${key} ${value}`);
    }
    const star = stars[0];

    const extraData = await Promise.all(
        [
            indexService.searchData(undefined, {
                types: ['episode'],
                filters: [
                    {
                        fields: ['stars.stars.id'],
                        query: star.id
                    }
                ]
            }, 0, 9999),
            seriesService.getSeries(0, 9990),
        ]
    );

    const { total: totalEpisodes = 0, episodes = [] } = extraData[0];
    const { total: totalSeries = 0, series = [] } = extraData[1];

    const episodesMap = {};
    const brandsMap = {};
    const seriesMap = {};
    const charitiesMap = {};
    episodes.forEach((episode) => {
        const { series: episodeSeries, brands: { brands }, charities: { charities } } = episode;
        episodesMap[episode.id] = episode;
        seriesMap[episodeSeries.id] = series.find(({ id }) => id === episodeSeries.id) ||{};
        charities.forEach((charity) => charitiesMap[charity.id] = charity);
        brands.forEach((brand) => brandsMap[brand.id] = brand);
    });

    star.episodes = new EpisodeListResponseModel(totalEpisodes, episodes);
    star.series = new SeriesListResponseModel(
        Object.keys(seriesMap).length,
        Object.values(seriesMap).map(s => {
            if (s.charity) {
                let episodes = [];
                const charitySeries = series.filter(cs => (cs.charity || {}).id === (s.charity || {}).id);
                charitySeries.forEach((s) => {
                    episodes = episodes.concat([...s.episodes.episodes]);
                });
                s.charity.episodes = new EpisodeListResponseModel(episodes.length, episodes);
            }
            return s;
        })
    );

    star.brands = new BrandListResponseModel(
        Object.keys(brandsMap).length,
        Object.values(brandsMap)
    );
    star.charities = new CharityListResponseModel(
        Object.keys(charitiesMap).length,
        Object.values(charitiesMap).map(charity => {
            const charitySeries = series.filter(s => (s.charity || {}).id === (charity || {}).id);
            let episodes = [];
            charitySeries.forEach((s) => {
                episodes = episodes.concat([...s.episodes.episodes]);
            });
            charity.episodes = new EpisodeListResponseModel(episodes.length, episodes);
            return charity;
        })
    );

    const populatedStar = await _getPopulatedStar(star, [], {
        [parameterTypeEnum.types.USERID.key]: parameters.userId
    });

    return new StarResponseModel(populatedStar);
};

async function _getStarMapBySlug(slug) {
    let starMap = await slugService.getMapBySlug(slug, slugService.typeKeys.star);

    // If there's no found match, look up all stars and generate each slug
    // to find the match, then save it.
    if (!starMap) {
        let offset = 0,
            found = false,
            error = false;
        while (!found && !error) {
            let stars = await this.getStars(offset, 10);
            if (!stars || stars.stars.length === 0) {
                error = true;
            } else {
                stars.stars.forEach(async (star) => {
                    if (slug === slugService.getSlugByValue(star.title)) {
                        starMap = {
                            entity_slug: slug,
                            entity_id: star._id,
                            type: 'star'
                        };
                        found = true;
                    }
                });
                offset += 10;
            }
        }
        if (starMap) {
            try {
                let response = await slugService.addSlugMap(starMap.entity_slug, starMap.entity_id, slugService.typeKeys.star);
                starMap.id = response.insertId;
            } catch (e) {
                console.error('Error saving slug map', e);
            }
        }
    }
    return starMap;
}

function _getSortedStars(sort, stars) {
    if (!sort) {
        return stars;
    }
    let sortKey,
        numericalSort = false,
        descending = (sort.startsWith('-'));

    switch (sort.replace(/^[-+]/, '').trim()) {
        case 'name':
            sortKey = 'title';
            break;
        default:
        case 'date':
            sortKey = 'publish_date';
            numericalSort = true;
            break;
    }

    stars.sort((a, b) => {
        if (numericalSort) {
            if (isNaN(parseInt(a[sortKey]))) {
                a[sortKey] = 0;
            }
            if (isNaN(parseInt(b[sortKey]))) {
                b[sortKey] = 0;
            }
            if (descending) {
                return parseInt(a[sortKey]) < parseInt(b[sortKey]);
            }
            return parseInt(a[sortKey]) > parseInt(b[sortKey]);
        }
        if (descending) {
            return b[sortKey].localeCompare(a[sortKey]);
        }
        return a[sortKey].localeCompare(b[sortKey]);
    });
    return stars;
}

async function _getStarBySlug(slug) {
    slug = (slug) ? slug.toLowerCase() : '';
    let starMap = await _getStarMapBySlug.call(this, slug);
    if (starMap && starMap.entity_id) {
        return _getStarById(starMap.entity_id);
    }
    throw new NotFoundErrorModel('No star found');
}

async function _getStarById(id) {
    let star = await proxyService.getProxyRequest('/celebrity/get_celebrity?id=' + id);
    if (star) {
        star.slug = slugService.getSlugByValue(star.title);
    }
    return star;
}

Service.prototype.getEpisodesByStarSlug = async function (slug, parameters) {
    slug = (slug) ? slug.toLowerCase() : '';
    parameters = parameters || {};
    let star = await _getStarBySlug.call(this, slug);
    if (star) {
        let episodes = new EpisodeListResponseModel(star.videos.length, star.videos);
        episodes.episodes = episodes.episodes
            .sort((a, b) => {
                return a.episodeNumber - b.episodeNumber;
            });
        if (parameters.offset !== undefined && parameters.limit !== undefined) {
            episodes.episodes = episodes.episodes.splice(parameters.offset, parameters.limit);
        }

        await mediaService.addTransformableImageUrls(episodes.episodes.map((episode) => {
            return episode.thumbnailPhoto;
        }));

        if (parameters.userId) {
            episodes.episodes = await favoritesPopulationService.getUserPopulatedEpisodes(parameters.userId, episodes.episodes);
        }

        return episodes;
    }
    throw new NotFoundErrorModel('No star found');
};

Service.prototype.getSeriesByStarSlug = async function (slug, parameters) {
    slug = (slug) ? slug.toLowerCase() : '';
    let star = await _getStarBySlug.call(this, slug);
    if (star) {
        let series = new SeriesListResponseModel(star.series.length, star.series.map((series) => {
            series.slug = slugService.getSlugByValue(series.title);

            // We don't need the episode data here...
            series.seasons = undefined;

            return series;
        }));

        if (parameters) {
            if (parameters.offset !== undefined && parameters.limit !== undefined) {
                series.series = series.series.splice(parameters.offset, parameters.limit);
            }
        }

        return series;
    }
    throw new NotFoundErrorModel('No star found');
};

/**
 * Adds a new star
 *
 * @param {StarRequestModel} model Request model
 * @returns {Promise.<StarResponseModel>} Response model
 * @throws DuplicateEntryErrorModel if a star already exists with that slug
 */
Service.prototype.addStar = async function (model) {
    if (!(model instanceof StarRequestModel)) {
        throw new InvalidRequestErrorModel('Request model to add star must be instance of StarRequestModel');
    }
    try {
        let insertResponse = await starDao.addStar(model.name, model.slug, new Date()),
            star = await starDao.getStarById(insertResponse.insertId);
        return new StarResponseModel(star);
    } catch (e) {
        if (e.code === 'ER_DUP_ENTRY') {
            throw new DuplicateEntryErrorModel('A star with that slug already exists');
        }
        throw e;
    }
};

/**
 * Updates a star with the provided ID
 *
 * @param {Number} id Star ID
 * @param {StarRequestModel} model Request model
 * @returns {Promise.<StarResponseModel>} Response model
 * @throws DuplicateEntryErrorModel if a star already exists with that slug
 */
Service.prototype.updateStarById = async function (id, model) {
    if (!(model instanceof StarRequestModel)) {
        throw new InvalidRequestErrorModel('Request model to update category must be instance of StarRequestModel');
    }
    let star = await starDao.getStarById(id);
    if (!star) {
        throw new NotFoundErrorModel('No star found matching ID ' + id);
    }

    try {
        let updateModel = Object.assign({}, star, model);

        delete updateModel.id;
        delete updateModel.updated_date;
        delete updateModel.created_date;

        await starDao.updateStarById(id, updateModel);
        return await this.getStarById(id);
    } catch (e) {
        if (e.code === 'ER_DUP_ENTRY') {
            throw new DuplicateEntryErrorModel('A star with that slug already exists');
        }
        throw e;
    }
};

/**
 * Returns the list of stars
 *
 * @param {Number} [offset=0] Number to offset list of stars
 * @param {Number} [limit=20] Total number of stars to return
 * @param parameters
 * @returns {Promise.<StarListResponseModel>}
 */
Service.prototype.getStars = async function (offset = 0, limit = 20, parameters = {}) {
    const { total, stars } = await indexService.searchData(
        '*',
        {
            types: ['star'],
            filters: [
                {
                    fields: ['enabled'],
                    query: true
                }
            ]
        }, offset, limit,
        [
            { order: { order: 'asc', missing: "_last", unmapped_type: "long" } },
            { 'slug.keyword': { order: "asc", missing: "_last", unmapped_type: "long" } },
        ]
    );

    const populatedStars = await _getPopulatedStars(stars, [], {
        [parameterTypeEnum.types.USERID.key]: parameters.userId
    });

    return new StarListResponseModel(total, populatedStars);
};

/**
 * Returns the star matching the provided ID
 *
 * @param {Number} id Star ID
 * @param parameters
 * @returns {Promise.<StarResponseModel>}
 * @throws NotFoundErrorModel if no star was found
 */
Service.prototype.getStarById = async function (id, parameters) {
    return getStarByProperty('id', id, parameters);
};

/**
 * Returns the stars matching the provided IDs
 *
 * @param {Number[]} ids Star IDs
 * @param parameters
 * @returns {Promise.<StarListResponseModel>}
 */
Service.prototype.getStarsByIds = async function (ids, parameters = {}) {
    const { total, stars } = await indexService.searchData(
        undefined,
        {
            types: ['star'],
            filters: [
                {
                    fields: ['id'],
                    query: ids.join(' OR ')
                }
            ]
        }
    );

    const populatedStars = await _getPopulatedStars(stars, [], {
        [parameterTypeEnum.types.USERID.key]: parameters.userId
    });

    return new StarListResponseModel(total, populatedStars);
};

/**
 * Returns the star matching the provided slug
 *
 * @param {String} slug Star slug
 * @param parameters
 * @returns {Promise.<StarResponseModel>}
 * @throws NotFoundErrorModel if no star was found
 */
Service.prototype.getStarBySlug = async function (slug, parameters) {
    return getStarByProperty('slug', slug, parameters);
};

Service.prototype.getStarBySlug = async function (slug, parameters) {
    return getStarByProperty('slug', slug, parameters);
};

/**
 * Returns the list of stars
 *
 * @param {Number} [offset=0] Number to offset list of stars
 * @param {Number} [limit=20] Total number of stars to return
 * @param parameters
 * @returns {Promise.<StarListResponseModel>}
 */
Service.prototype.getStarsSirqul = async function (offset = 0, limit = 20, parameters = {}) {

    return sirqulService.getEntitiesPromise(entityType, offset, limit, parameters, "ALBUM_TITLE", "false")
        .then((sirqulEntities)=>{
            if(sirqulEntities){
                return new StarListResponseModel(sirqulEntities.countTotal, sirqulEntities.items, true, "album");
            }
            return null;
        });
};

Service.prototype.getStarBySlugSirqul = async function (slug, parameters) {
    let self = this;
    return sirqulService.getEntityBySlug(entityType, slug, parameters)
        .then((data)=>{
            if(data){
                let result = new StarResponseModel(data, true);
                result = self.processStarSirqul(result);
                return result;
            }
            return null;
        })
};

Service.prototype.getStarByIdSirqul = async function (id, parameters) {
    let self = this;
    return sirqulService.getEntityById(entityType, id, parameters)
        .then((data)=>{
            if(data){
                let result = new StarResponseModel(data, true);
                result = self.processStarSirqul(result);
                return result;
            }
            return null;
        })
};

Service.prototype.processStarSirqul = async function(star){
    let starSeries = [];
    (star.episodes && star.episodes.episodes || []).forEach((ep)=>{
        if(ep.series){
            let ss = starSeries.find((se)=> ep.series.id === se.id)
            if(!ss){
                ss = JSON.parse(JSON.stringify(ep.series));
                starSeries.push(ss);
            }
            if(!ss.episodes)
                ss.episodes = {total : 0, episodes : []};
            ss.episodes.episodes.push(JSON.parse(JSON.stringify(ep)));
            ss.episodes.total = ss.episodes.episodes.length;
        }
    });
    if(starSeries){
        star.series = {total: starSeries.length, series: starSeries};
    }
    return star;
}

module.exports = new Service();