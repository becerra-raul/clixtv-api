let apiUtils = require('../utils/api-utils'),
    slugService = require('./slug-service'),
    proxyService = require('./proxy-service'),
    mediaService = require('./media-service'),
    sirqulService = require('./sirqul-service'),
    favoritesPopulationService = require('./favorites-population-service'),
    episodePopulationService = require('./episode-population-service'),
    favoriteDao = require('../persistence/favorite-dao'),
    episodeDao = require('../persistence/episode-dao'),
    seriesDao = require('../persistence/series-dao'),
    videoDao = require('../persistence/video-dao'),
    starDao = require('../persistence/star-dao'),
    brandDao = require('../persistence/brand-dao'),
    charityDao = require('../persistence/charity-dao'),
    entityTypeEnum = require('../models/enum/entity-type-enum'),
    parameterTypeEnum = require('../models/enum/parameter-type-enum'),
    NotFoundErrorModel = require('../models/not-found-error-model'),
    EpisodeResponseModel = require('../models/response/episode-response-model'),
    EpisodeListResponseModel = require('../models/response/episode-list-response-model');

const zypeService = require('./zype-service');
const indexService = require('./index-service');

const SeriesResponseModel = require('../models/response/series-response-model');
const BrandListResponseModel = require('../models/response/brand-list-response-model');
const StarResponseModel = require('../models/response/star-response-model');
const CharityResponseModel = require('../models/response/charity-response-model');
const entityType = "episodes";

function Service() {}


async function _getPopulatedEpisodes(episodes = [], fields, parameters) {
    const starIds = [];

    const episodeIds = episodes.map(({ id, star = {} }) => {
        if (!starIds.includes(star.id)) {
            starIds.push(star.id);
        }
        return id;
    });

    const userId = (parameters) ? parameters[parameterTypeEnum.types.USERID.key] : undefined;

    if (!userId) {
        return episodes;
    }

    const data = await Promise.all(
        [
            (episodeIds.length > 0) && favoriteDao.getUserFavoritesByIdsAndType(
                userId,
                episodeIds,
                entityTypeEnum.types.EPISODE
            ),
            (starIds.length > 0) && favoriteDao.getUserFavoritesByIdsAndType(
                userId,
                starIds,
                entityTypeEnum.types.STAR
            ),
            (episodeIds.length > 0) && favoriteDao.getUserFavoritesByIdsAndType(
                userId,
                episodeIds,
                entityTypeEnum.types.EPISODE_SOCIAL
            )
        ]
    );

    const favoriteEpisodes = data[0];
    const favoriteStars = data[1];
    const likedEpisodes = data[2];

    episodes.forEach((episode) => {
        if (favoriteEpisodes) {
            episode.isFavorite = favoriteEpisodes.filter(favorite => favorite.entity_id === episode.id).length > 0;
        }
        if (likedEpisodes) {
            episode.isLiked = likedEpisodes.filter(favorite => favorite.entity_id === episode.id).length > 0;
        }
        if (favoriteStars) {
            episode.star.isFavorite = favoriteStars.filter(favorite => favorite.entity_id === episode.star.id).length > 0;
        }
    });

    return episodes;
}

/**
 * Returns the provided episode with its requested fields populated
 *
 * @private
 * @param {Object} episode Episode to populate
 * @param {String[]} [fields] Fields to populate
 * @param {Object} [parameters] Parameters used for population
 * @returns {Promise<Object>}
 */
async function _getPopulatedEpisode(episode, fields, parameters) {
    let episodes = await _getPopulatedEpisodes([episode], fields, parameters);
    return episodes[0];
}

const getEpisodeByProperty = async (key, value, parameters = {}) => {
    const { total, episodes } = await indexService.searchData(null, {
        types: ['episode'],
        filters: [
            {
                fields: [key],
                query: value
            }
        ]
    });
    if (total === 0) {
        throw new NotFoundErrorModel(`No episode found matching ${key} ${value}`);
    }

    const episode = episodes[0];

    const populatedEpisode = await _getPopulatedEpisode(episode, [], {
        [parameterTypeEnum.types.USERID.key]: parameters.userId
    });

    if (populatedEpisode.videoIds) {
        const videoId = populatedEpisode.videoIds[0];
        try {
            const { plays = 0 } = await zypeService.getAnalyticsByVideoId(videoId);
            populatedEpisode.views = plays;
        } catch (e) {
            console.warn(`Error getting analytics for video ID ${videoId}`, e);
        }
        populatedEpisode.video = `https://player.zype.com/embed/${videoId}.html?api_key=lqWpdpK84QuVAodGi7j0ccvUSF7amrVNoBzxl_VfLt5U6CAbcdwgprzGRXFbBff7&autoplay=true`;
        populatedEpisode.zypeVideo = videoId;
    }

    populatedEpisode.likes = await favoriteDao.getTotalFavoritesByIdAndType(populatedEpisode.id, entityTypeEnum.types.EPISODE_SOCIAL);

    return new EpisodeResponseModel(populatedEpisode);
};


async function _getEpisodeMapBySlug(slug) {
    let episodeMap = await slugService.getMapBySlug(slug, slugService.typeKeys.episode);

    // If there's no found match, look up all episodes and generate each slug
    // to find the match, then save it.
    if (!episodeMap) {
        let offset = 0,
            found = false,
            error = false;
        while (!found && !error) {
            let episodes = await this.getEpisodes(offset, 10);
            if (!episodes || episodes.length === 0) {
                error = true;
            } else {
                episodes.forEach(async(episode) => {
                    if (slug === slugService.getSlugByValue(episode.serie_title + ' ' + episode.title)) {
                        episodeMap = {
                            entity_slug: slug,
                            entity_id: episode._id,
                            type: 'episode'
                        };
                        found = true;
                    }
                });
                offset += 10;
            }
        }
        if (episodeMap) {
            try {
                let response = await slugService.addSlugMap(episodeMap.entity_slug, episodeMap.entity_id, slugService.typeKeys.episode);
                episodeMap.id = response.insertId;
            } catch (e) {
                console.error('Error saving slug map', e);
            }
        }
    }
    return episodeMap;
}

async function _getEpisodeBySlug(slug) {
    slug = (slug) ? slug.toLowerCase() : '';
    let episodeMap = await _getEpisodeMapBySlug.call(this, slug);
    if (episodeMap && episodeMap.entity_id) {
        return _getEpisodeById(episodeMap.entity_id);
    }
    throw new NotFoundErrorModel('No episode found');
}

async function _getEpisodeById(id) {
    let episode = await proxyService.getProxyRequest('/video/get_video_by_id?id=' + id);
    if (episode) {
        if (episode.serie) {
            episode.serie.slug = slugService.getSlugByValue(episode.serie.title);
            episode.slug = slugService.getSlugByValue(episode.serie.title + ' ' + episode.title);
        } else {
            episode.slug = slugService.getSlugByValue(episode.serie_title + ' ' + episode.title);
        }

        if (episode.celebrity) {
            episode.celebrity.slug = slugService.getSlugByValue(episode.celebrity.title);
        }
    }
    return episode;
}

// Service.prototype.getEpisodeById = async function(id, parameters) {
//     let episode = await _getEpisodeById(id),
//         episodeResponse = new EpisodeResponseModel(episode);
//
//     parameters = parameters || {};
//
//     if (episodeResponse.endPhoto) {
//         await mediaService.addTransformableImageUrls(episodeResponse.endPhoto);
//     }
//
//     if (parameters.userId && episodeResponse.id) {
//
//         let favorites = await favoritesPopulationService.getUserPopulatedEpisodes(parameters.userId, [episodeResponse]);
//         episodeResponse = favorites[0];
//     }
//
//     let episodeData = await episodeDao.getEpisodeBySlug(episodeResponse.slug);
//     if (episodeData && episodeData.video) {
//         let video = await videoDao.getVideoById(episodeData.video);
//         if (video) {
//             episodeResponse.video = apiUtils.getPaths().cdn + '/' + video.url;
//         }
//     }
//
//     return episodeResponse;
// };

Service.prototype.getEpisodesByIds = async function(ids) {
    ids = (ids instanceof Array) ? ids : [ids];
    let episodes = await Promise.all(
        ids.map((id) => {
            return proxyService.getProxyRequest('/video/get_video_by_id?id=' + id);
        })
    );
    return episodes.map((episode) => {
        if (episode.serie) {
            episode.serie.slug = slugService.getSlugByValue(episode.serie.title);
            episode.slug = slugService.getSlugByValue(episode.serie.title + ' ' + episode.title);
        } else {
            episode.slug = slugService.getSlugByValue(episode.serie_title + ' ' + episode.title);
        }

        if (episode.celebrity) {
            episode.celebrity.slug = slugService.getSlugByValue(episode.celebrity.title);
        }
        return episode;
    });
};

// Service.prototype.getEpisodeBySlug = async function(slug, parameters) {
//     slug = (slug) ? slug.toLowerCase() : '';
//     parameters = parameters || {};
//     let episodeMap = await _getEpisodeMapBySlug.call(this, slug);
//     if (episodeMap && episodeMap.entity_id) {
//         return this.getEpisodeById(episodeMap.entity_id, parameters);
//     }
//     throw new NotFoundErrorModel('No episode found');
// };

Service.prototype.getRelatedEpisodesByEpisodeSlug = async function(slug, parameters) {
    const { episodes = [] } = await indexService.searchData('*', {
        types: [ 'episode' ]
    }, 0, 9999);

    const { categoryIds = [], series = {} } = episodes.find((episode) => episode.slug === slug);
    if (!categoryIds.length) {
        return new EpisodeListResponseModel(0, []);
    }

    const related = [];
    episodes.forEach((episode) => {
        categoryIds.forEach((categoryId) => {
            if (
                episode.categoryIds.includes(categoryId) &&
                (episode.series || {}).id !== series.id &&
                related.find(({ slug }) => slug === episode.slug) === undefined
            ) {
                related.push(episode);
            }
        })
    });

    if (!related.length) {
        return new EpisodeListResponseModel(0, []);
    }

    const populatedEpisodes = await _getPopulatedEpisodes(
        related,
        [entityTypeEnum.types.EPISODE],
        parameters
    );

    return new EpisodeListResponseModel(related.length, populatedEpisodes);
};

/**
 * Returns the populated user data for the provided list of episodes. *Warning:* this can
 * be a heavy call depending on the length of the list of episodes. Use with caution.
 *
 * @param {String|Number} userId User ID for data population
 * @param {EpisodeResponseModel[} episodes List of episodes
 * @returns {Promise.<EpisodeResponseModel[}>} List of populated episodes
 */
Service.prototype.getUserPopulatedEpisodes = async function(userId, episodes) {
    if (!episodes || episodes.length === 0) {
        return [];
    }

    // 1. Gather up the required entity IDs
    let episodeIds = [],
        starIds = [];

    episodes.forEach((episode) => {
        if (episodeIds.indexOf(episode.id) === -1) {
            episodeIds.push(episode.id);
        }
        if (episode.star && episode.star.id) {
            if (starIds.indexOf(episode.star.id) === -1) {
                starIds.push(episode.star.id);
            }
        }
    });

    // 2. Fetch the favorites data
    let favorites = await Promise.all(
        [
            favoriteDao.getUserFavoritesByIdsAndType(userId, episodeIds, entityTypeEnum.types.EPISODE),
            (starIds.length > 0) ? favoriteDao.getUserFavoritesByIdsAndType(userId, starIds, entityTypeEnum.types.STAR) : undefined
        ]
    );

    // 3. Populate the entities
    let episodeFavorites = favorites[0] || [],
        starFavorites = favorites[1] || [];

    episodes = episodes.map((episode) => {
        episode.isFavorite = episodeFavorites.filter((favorite) => {
            return favorite.entity_id === episode.id;
        }).length > 0;
        if (episode.star && episode.star.id) {
            episode.star.isFavorite = starFavorites.filter((favorite) => {
                return favorite.entity_id === episode.star.id;
            }).length > 0;
        }
        return episode;
    });

    // 4. Profit
    return episodes;
};



/**
 * Returns the episode matching the provided slug
 *
 * @public
 * @param {String} slug Episode slug
 * @param parameters
 * @returns {Promise.<EpisodeResponseModel>}
 * @throws NotFoundErrorModel if no episode was found
 */
Service.prototype.getEpisodeBySlug = async function(slug, parameters) {
    return getEpisodeByProperty('slug', slug, parameters);
};

/**
 * Returns the episode matching the provided ID
 *
 * @public
 * @param {Number} id Episode number
 * @param parameters
 * @returns {Promise.<EpisodeResponseModel>}
 * @throws NotFoundErrorModel if no episode was found
 */
Service.prototype.getEpisodeById = async function(id, parameters) {
    return getEpisodeByProperty('id', id, parameters);
};

/**
 * Returns the episodes matching the provided IDs
 *
 * @public
 * @param {Number[]} ids Episode IDs
 * @param parameters
 * @returns {Promise.<EpisodeListResponseModel>}
 */
Service.prototype.getEpisodesByIds = async function(ids, parameters) {
    const { total, episodes } = await indexService.searchData(null, {
        types: ['episode'],
        filters: [
            {
                fields: ['id'],
                query: ids.join(' OR ')
            }
        ]
    });

    const populatedEpisodes = await _getPopulatedEpisodes(
        episodes,
        [entityTypeEnum.types.EPISODE],
        parameters
    );

    return new EpisodeListResponseModel(total, populatedEpisodes);
};

Service.prototype.getEpisodes = async function(offset = 0, limit = 20) {
    const { total, episodes } = await indexService.searchData('*', {
        types: ['episode']
    }, offset, limit);

    return new EpisodeListResponseModel(total, episodes);
};

Service.prototype.getEpisodeBySlugSirqul = async function(slug, parameters) {
    return sirqulService.getEntityBySlug(entityType, slug, parameters)
        .then((data)=>{
            if(data){
                return new EpisodeResponseModel(data, true);
            }
            return null;
        })
};

Service.prototype.getEpisodeByIdSirqul = async function(id, parameters) {
    return sirqulService.getEntityById(entityType, id, parameters)
        .then((data)=>{
            if(data){
                return new EpisodeResponseModel(data, true);
            }
            return null;
        })
};

Service.prototype.getRelatedEpisodesByEpisodeSlugSirqul = async function(slug, parameters) {
    return sirqulService.getEntityBySlug(entityType, slug, parameters)
        .then((data)=>{
            if(data){
                // get list of category album ids
                // main logic for getting related episodes
                let episode = new EpisodeResponseModel(data, true);
                let categoryAudienceIds = episode.categories.categories
                    .map((item) => { return item.audienceId})
                    .filter((id)=> id != null && id !== undefined);
                let seriesAudienceId = episode.series ? episode.series.audienceId : null;
                if(categoryAudienceIds.length && seriesAudienceId){
                    let audienceIds = categoryAudienceIds.join(",");
                    let excludeAudienceIds = seriesAudienceId;
                    let extraParameters = {
                        excludeAudienceIds : excludeAudienceIds,
                        excludeAlbumIds : episode.id
                    }
                    return sirqulService
                        .getSubEntitiesByEntityPromise(null, audienceIds, entityType, "episodes", 0, 25, extraParameters);
                }
            }
            return new EpisodeListResponseModel(0,[], true);
        })
};

module.exports = new Service();