let apiUtils = require('../utils/api-utils'),
    slugService = require('./slug-service'),
    proxyService = require('./proxy-service'),
    mediaService = require('./media-service'),
    favoritesPopulationService = require('./favorites-population-service'),
    episodePopulationService = require('./episode-population-service'),
    sirqulService = require('./sirqul-service'),
    favoriteDao = require('../persistence/favorite-dao'),
    charityDao = require('../persistence/charity-dao'),
    episodeDao = require('../persistence/episode-dao'),
    starDao = require('../persistence/star-dao'),
    entityTypeEnum = require('../models/enum/entity-type-enum'),
    parameterTypeEnum = require('../models/enum/parameter-type-enum'),
    NotFoundErrorModel = require('../models/not-found-error-model'),
    CharityListResponseModel = require('../models/response/charity-list-response-model'),
    CharityResponseModel = require('../models/response/charity-response-model'),
    StarListRepsonseModel = require('../models/response/star-list-response-model'),
    EpisodeListResponseModel = require('../models/response/episode-list-response-model');

const zypeConfig = apiUtils.getZypeConfig();
const indexService = require('./index-service');
const episodeService = require('./episode-service');
const entityType = "charities";

function Service() { }

/**
 * Returns the provided list of charities with their requested fields populated
 *
 * @private
 * @param {Object[]} charities List of charities to populate
 * @param {String[]} [fields] Fields to populate
 * @param {Object} [parameters] Parameters used for population
 * @returns {Promise<Object[]>}
 */
async function _getPopulatedCharities(charities, fields, parameters) {
    fields = fields || [];
    parameters = parameters || {};

    if (!charities || charities.length === 0) {
        return [];
    }

    return new Promise(async (resolve, reject) => {

        let charityIds = [],
            stars = [];

        let favoriteCharities = [],
            favoriteStars = [];

        charities.forEach((charity) => {
            charityIds.push(charity.id);
        });

        if (parameters[parameterTypeEnum.types.USERID.key]) {
            favoriteCharities = await favoriteDao.getUserFavoritesByIdsAndType(parameters[parameterTypeEnum.types.USERID.key], charityIds, entityTypeEnum.types.CHARITY);
            if (stars.length > 0) {
                favoriteStars = await favoriteDao.getUserFavoritesByIdsAndType(parameters[parameterTypeEnum.types.USERID.key], stars.map((star) => star.id), entityTypeEnum.types.STAR);
                stars = stars.map((star) => {
                    star.isFavorite = favoriteStars.filter((favoriteStar) => (favoriteStar.entity_id + '') === (star.id + '')).length > 0;
                    return star;
                })
            }
        }

        charities.forEach((charity) => {
            if (parameters[parameterTypeEnum.types.USERID.key]) {
                charity.isFavorite = favoriteCharities.filter((favoriteCharity) => {
                    return (favoriteCharity.entity_id + '') === (charity.id + '');
                }).length > 0;
            }

            if (fields.indexOf(entityTypeEnum.types.STAR) !== -1) {
                charity.stars = new StarListRepsonseModel(stars.length, stars);
            }
        });

        resolve(charities);
    })
}

/**
 * Returns the provided charity with its requested fields populated
 *
 * @private
 * @param {Object} charity Charity to populate
 * @param {String[]} [fields] Fields to populate
 * @param {Object} [parameters] Parameters used for population
 * @returns {Promise<Object>}
 */
async function _getPopulatedCharity(charity, fields, parameters) {
    let charities = await _getPopulatedCharities([charity], fields, parameters);
    return charities[0];
}

const getCharityByProperty = async (key, value, parameters) => {
    const { total, charities } = await indexService.searchData(null, {
        types: ['charity'],
        filters: [
            {
                fields: [key],
                query: value
            }
        ]
    });
    if (total === 0) {
        throw new NotFoundErrorModel(`No charity found matching key ${value}`);
    }
    const charity = charities[0];

    const { episodes: charityEpisodes = [] } = await indexService.searchData(null, {
        types: ['episode'],
        filters: [
            {
                fields: [`charities.charities.id`],
                query: charity.id
            }
        ]
    });

    const data = await Promise.all(
        [
            episodeService.getEpisodesByIds(
                charityEpisodes.map(episode => episode.id),
                {
                    [parameterTypeEnum.types.USERID.key]: parameters.userId
                }
            ),
            indexService.searchData(null, {
                types: ['star'],
                filters: [
                    {
                        fields: ['episodes.episodes.charities.charities.id'],
                        query: charity.id
                    }
                ]
            })
        ]
    );

    const { episodes = [] } = data[0];


    charity.episodes = data[0];



    const stars = {};
    episodes.forEach((episode) => {
        const { star } = episode;
        if (!stars[star.slug]) {
            stars[star.slug] = { episodes: [], star: star };
        }
        stars[star.slug].episodes.push(episode);
    });

    charity.stars = new StarListRepsonseModel(Object.keys(stars).length, Object.values(stars).map((star) => {
        const model = { ...star.star };
        model.episodes = new EpisodeListResponseModel(star.episodes.length, star.episodes);
        return model;
    }));

    const populatedCharity = await _getPopulatedCharity(charity, [], {
        [parameterTypeEnum.types.USERID.key]: parameters.userId
    });

    if (populatedCharity.videoIds) {
        populatedCharity.video = `https://player.zype.com/embed/${populatedCharity.videoIds[0]}.html?api_key=${zypeConfig.readOnly}`;
        populatedCharity.zypeVideo = populatedCharity.videoIds[0];
    }

    return new CharityResponseModel(populatedCharity);
};

async function _getCharityMapBySlug(slug) {
    let charityMap = await slugService.getMapBySlug(slug, slugService.typeKeys.charity);

    // If there's no found match, look up all charities and generate each slug
    // to find the match, then save it.
    if (!charityMap) {
        let offset = 0,
            found = false,
            error = false;
        while (!found && !error) {
            let charities = await this.getCharities(offset, 10);
            if (!charities || charities.length === 0) {
                error = true;
            } else {
                charities.forEach(async (charity) => {
                    if (slug === slugService.getSlugByValue(charity.title)) {
                        charityMap = {
                            entity_slug: slug,
                            entity_id: charity._id,
                            type: 'charity'
                        };
                        found = true;
                    }
                });
                offset += 10;
            }
        }
        if (charityMap) {
            try {
                let response = await slugService.addSlugMap(charityMap.entity_slug, charityMap.entity_id, slugService.typeKeys.charity);
                charityMap.id = response.insertId;
            } catch (e) {
                console.error('Error saving slug map', e);
            }
        }
    }
    return charityMap;
}

function _getSortedCharities(sort, charities) {
    if (!sort) {
        return charities;
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

    charities.sort((a, b) => {
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
    return charities;
}

async function _getCharityBySlug(slug) {
    slug = (slug) ? slug.toLowerCase() : '';
    let charityMap = await _getCharityMapBySlug.call(this, slug);
    if (charityMap && charityMap.entity_id) {
        return await _getCharityById(charityMap.entity_id);
    }
    throw new NotFoundErrorModel('No charity found');
}

async function _getCharityById(id) {
    let charity = await proxyService.getProxyRequest('/brands/get_charity?id=' + id);
    if (charity) {
        return charity[0]; // For some reason this is returned as an array
    }
    return undefined;
}

Service.prototype.getStarsByCharitySlug = async function (slug, parameters) {
    slug = (slug) ? slug.toLowerCase() : '';
    parameters = parameters || {};
    let charity = await _getCharityBySlug.call(this, slug);
    if (charity) {
        let stars = new StarListRepsonseModel(charity.celebrities.length, charity.celebrities);
        stars.stars = stars.stars.map((star) => {
            star.slug = slugService.getSlugByValue(star.name);
            star.episodes.episodes = star.episodes.episodes.sort((a, b) => {
                return parseInt(a.episodeNumber) > parseInt(b.episodeNumber);
            });
            return star;
        });
        if (parameters.offsetEpisodes !== undefined && parameters.limitEpisodes !== undefined) {
            stars.stars = stars.stars.map((star) => {
                star.episodes.episodes = star.episodes.episodes.splice(parameters.offsetEpisodes, parameters.limitEpisodes);
                return star;
            })
        }
        if (parameters.userId) {
            stars.stars = await favoritesPopulationService.getUserPopulatedStars(parameters.userId, stars.stars);
        }
        return stars;
    }
    throw new NotFoundErrorModel('No charity found');
};

Service.prototype.getEpisodesByCharitySlug = async function (slug, parameters) {
    slug = (slug) ? slug.toLowerCase() : '';
    parameters = parameters || {};
    let charity = await _getCharityBySlug.call(this, slug);
    if (charity) {
        let episodes = new EpisodeListResponseModel(charity.videos.length, charity.videos);
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
    throw new NotFoundErrorModel('No charity found');
};

Service.prototype.getStarByCharitySlug = async function (slug, starSlug, parameters) {
    let stars = await this.getStarsByCharitySlug(slug, parameters);
    if (stars) {
        let star = stars.stars.filter((star) => {
            return star.slug === starSlug;
        });
        if (!star || star.length === 0) {
            throw new NotFoundErrorModel('No star found');
        }
        return star[0];
    }
    throw new NotFoundErrorModel('No charity found');
};

/**
 * Returns the list of charities
 *
 * @param {Number} [offset=0] Number to offset list of charities
 * @param {Number} [limit=20] Total number of charities to return
 * @param parameters
 * @returns {Promise.<CharityListResponseModel>}
 */
Service.prototype.getCharities = async function (offset = 0, limit = 20, parameters = {}) {
    const { total, charities } = await indexService.searchData('*', {
        types: ['charity']
    }, offset, limit,
        [
            { order: { order: 'asc', missing: "_last", unmapped_type: "long" } },
            { 'slug.keyword': { order: "asc", missing: "_last", unmapped_type: "string" }}
        ]);

    const { episodes } = await indexService.searchData(null, {
        types: ['episode'],
        filters: [
            {
                fields: [`charities.charities.id`],
                query: (charities || []).map(charity => charity.id).join(' OR ')
            }
        ]
    })

    const charitiesEpisodes = {}
    if (episodes) {
        episodes.forEach((episode) => {
            episode.charities.charities.forEach(charity => {
                const key = charity.id;
                if (!charitiesEpisodes[key]) {
                    charitiesEpisodes[key] = [];
                }
                charitiesEpisodes[key].push(episode);
            })
        })
    }

    const populatedCharities = await _getPopulatedCharities(charities, [], {
        [parameterTypeEnum.types.USERID.key]: parameters.userId
    });
    return new CharityListResponseModel(total, populatedCharities.map((charity) => {
        const charityEpisodes = charitiesEpisodes[charity.id] || [];
        charity.episodes = new EpisodeListResponseModel(charityEpisodes.length, charityEpisodes);
        return charity;
    }));
};

/**
 * Returns the charity matching the provided slug
 *
 * @param {String} slug Charity slug
 * @param parameters
 * @returns {Promise.<CharityResponseModel>}
 * @throws NotFoundErrorModel if no brand was found
 */
Service.prototype.getCharityBySlug = async function (slug, parameters) {
    return getCharityByProperty('slug', slug, parameters);
};

/**
 * Returns the charity matching the provided ID
 *
 * @public
 * @param {Number} id Charity ID
 * @param parameters
 * @returns {Promise.<CharityResponseModel>}
 * @throws NotFoundErrorModel if no charity was found
 */
Service.prototype.getCharityById = async function (id, parameters) {
    return getCharityByProperty('id', id, parameters);
};

/**
 * Returns the charities matching the provided IDs
 *
 * @public
 * @param {Number[]} ids Charity IDs
 * @param parameters
 * @returns {Promise.<CharityListResponseModel>}
 */
Service.prototype.getCharitiesByIds = async function (ids, parameters = {}) {
    const { total, charities } = await indexService.searchData(
        undefined,
        {
            types: ['charity'],
            filters: [
                {
                    fields: ['id'],
                    query: ids.join(' OR ')
                }
            ]
        }
    );

    const { episodes } = await indexService.searchData(null, {
        types: ['episode'],
        filters: [
            {
                fields: [`charities.charities.id`],
                query: (charities || []).map(charity => charity.id).join(' OR ')
            }
        ]
    })

    const charitiesEpisodes = {}
    if (episodes) {
        episodes.forEach((episode) => {
            episode.charities.charities.forEach(charity => {
                const key = charity.id;
                if (!charitiesEpisodes[key]) {
                    charitiesEpisodes[key] = [];
                }
                charitiesEpisodes[key].push(episode);
            })
        })
    }

    const populatedCharities = await _getPopulatedCharities(charities, [], {
        [parameterTypeEnum.types.USERID.key]: parameters.userId
    });

    return new CharityListResponseModel(total, populatedCharities.map((charity) => {
        const charityEpisodes = charitiesEpisodes[charity.id] || [];
        charity.episodes = new EpisodeListResponseModel(charityEpisodes.length, charityEpisodes);
        return charity;
    }));
};

Service.prototype.getCharitiesSirqul = async function (offset = 0, limit = 20, parameters = {}) {
    return sirqulService.getEntitiesPromise(entityType, offset, limit, parameters)
        .then((sirqulEntities)=>{
            if(sirqulEntities){
                return new CharityListResponseModel(sirqulEntities.countTotal, sirqulEntities.items, true, "album");
            }
            return null;
        });
};

Service.prototype.getCharityBySlugSirqul = async function (slug, parameters) {
    return sirqulService.getEntityBySlug(entityType, slug, parameters)
        .then((data)=>{
            if(data){
                let result = new CharityResponseModel(data, true, "album");
                return result;
            }
            return null;
        });
};

Service.prototype.getCharityByIdSirqul = async function (id, parameters) {
    return sirqulService.getEntityById(entityType, id, parameters)
        .then((data)=>{
            if(data){
                let result = new CharityResponseModel(data, true, "album");
                return result;
            }
            return null;
        });
};

module.exports = new Service();