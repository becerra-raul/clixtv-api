let apiUtils = require('../utils/api-utils'),
    brandDao = require('../persistence/brand-dao'),
    videoDao = require('../persistence/video-dao'),
    slugService = require('./slug-service'),
    proxyService = require('./proxy-service'),
    mediaService = require('./media-service'),
    favoritesPopulationService = require('./favorites-population-service'),
    episodePopulationService = require('./episode-population-service'),
    sirqulService = require('./sirqul-service'),
    favoriteDao = require('../persistence/favorite-dao'),
    starDao = require('../persistence/star-dao'),
    offerDao = require('../persistence/offer-dao'),
    episodeDao = require('../persistence/episode-dao'),
    entityTypeEnum = require('../models/enum/entity-type-enum'),
    parameterTypeEnum = require('../models/enum/parameter-type-enum'),
    NotFoundErrorModel = require('../models/not-found-error-model'),
    BrandListResponseModel = require('../models/response/brand-list-response-model'),
    BrandResponseModel = require('../models/response/brand-response-model'),
    StarListRepsonseModel = require('../models/response/star-list-response-model'),
    OfferListResponseModel = require('../models/response/offer-list-response-model'),
    EpisodeListResponseModel = require('../models/response/episode-list-response-model');

const zypeConfig = apiUtils.getZypeConfig();
const indexService = require('./index-service');
const episodeService = require('./episode-service');
const entityType = "brand";

function Service() { }

/**
 * Returns the provided list of brands with their requested fields populated
 *
 * @private
 * @param {Object[]} brands List of brands to populate
 * @param {String[]} [fields] Fields to populate
 * @param {Object} [parameters] Parameters used for population
 * @returns {Promise<Object[]>}
 */
async function _getPopulatedBrands(brands, fields, parameters) {
    fields = fields || [];
    parameters = parameters || {};

    if (!brands || brands.length === 0) {
        return [];
    }

    return new Promise(async (resolve, reject) => {

        let brandIds = [],
            offers = [],
            stars = [],
            episodes = [];

        let favoriteBrands = [],
            favoriteOffers = [],
            favoriteStars = [];

        const offerIds = [];

        brands.forEach((brand) => {
            brandIds.push(brand.id);
            if (brand.offers) {
                brand.offers.offers.forEach((offer) => {
                    if (!offerIds.includes(offer.id)) {
                        offerIds.push(offer.id);
                    }
                })
            }
        });

        if (parameters[parameterTypeEnum.types.USERID.key]) {
            favoriteBrands = await favoriteDao.getUserFavoritesByIdsAndType(parameters[parameterTypeEnum.types.USERID.key], brandIds, entityTypeEnum.types.BRAND);

            if (offerIds.length > 0) {
                favoriteOffers = await favoriteDao.getUserFavoritesByIdsAndType(parameters[parameterTypeEnum.types.USERID.key], offerIds, entityTypeEnum.types.OFFER);
            }

            if (stars && stars.length > 0) {
                favoriteStars = await favoriteDao.getUserFavoritesByIdsAndType(parameters[parameterTypeEnum.types.USERID.key], stars.map((star) => star.id), entityTypeEnum.types.STAR);
            }
        }

        brands.forEach((brand) => {

            brand.offers.offers.forEach((offer) => {
                offer.isFavorite = (favoriteOffers.filter((favorite) => (favorite.entity_id + '') === (offer.id + '')).length > 0);
            });

            if (parameters[parameterTypeEnum.types.USERID.key]) {
                brand.isFavorite = (favoriteBrands.filter((favorite) => (favorite.entity_id + '') === (brand.id + '')).length > 0);
            }

            if (fields.indexOf(entityTypeEnum.types.OFFER) !== -1) {
                let brandOffers = offers.filter((offer) => {
                    return (offer.brand + '') === (brand.id + '');
                });

                brand.offers = new OfferListResponseModel(brandOffers.length, brandOffers.map((offer) => {
                    let offerBrand = Object.assign({}, brand);
                    delete offerBrand.offer;
                    offer.brand = offerBrand;

                    if (parameters[parameterTypeEnum.types.USERID.key]) {
                        offer.isFavorite = (favoriteOffers.filter((favorite) => (favorite.entity_id + '') === (offer.id + '')).length > 0);
                    }

                    return offer;
                }));
            }

            if (fields.indexOf(entityTypeEnum.types.STAR) !== -1) {
                brand.stars = new StarListRepsonseModel(stars.length, stars);
            }

            if (fields.indexOf(entityTypeEnum.types.EPISODE) !== -1) {
                brand.episodes = new EpisodeListResponseModel(episodes.length, episodes);
            }
        });

        resolve(brands);
    })
}

/**
 * Returns the provided brand with its requested fields populated
 *
 * @private
 * @param {Object} brand Brand to populate
 * @param {String[]} [fields] Fields to populate
 * @param {Object} [parameters] Parameters used for population
 * @returns {Promise<Object>}
 */
async function _getPopulatedBrand(brand, fields, parameters) {
    let brands = await _getPopulatedBrands([brand], fields, parameters);
    return brands[0];
}

const getBrandByProperty = async (key, value, parameters) => {
    const { total, brands } = await indexService.searchData(null, {
        types: ['brand'],
        filters: [
            {
                fields: [key],
                query: value
            }
        ]
    });
    if (total === 0) {
        throw new NotFoundErrorModel(`No brand found matching slug ${value}`);
    }
    const brand = brands[0];

    if (brand.offers) {
        brand.offers = new OfferListResponseModel(brand.offers.total, brand.offers.offers.map((offer) => {
            const brandWithoutOffer = JSON.parse(JSON.stringify(brand));
            delete brandWithoutOffer.offers;
            offer.brand = new BrandResponseModel(brandWithoutOffer);
            return offer;
        }));
    }

    const { episodes: brandEpisodes = [] } = await indexService.searchData(null, {
        types: ['episode'],
        filters: [
            {
                fields: [`brands.brands.${key}.keyword`],
                query: value
            }
        ]
    });

    const data = await Promise.all(
        [
            (brandEpisodes.length > 0) && episodeService.getEpisodesByIds(
                brandEpisodes.map(episode => episode.id),
                {
                    [parameterTypeEnum.types.USERID.key]: parameters.userId
                }
            )
        ]
    );

    const { episodes = [] } = data[0];
    brand.episodes = data[0];

    const stars = {};
    episodes.forEach((episode) => {
        const { star } = episode;
        if (!stars[star.slug]) {
            stars[star.slug] = { episodes: [], star: star };
        }
        stars[star.slug].episodes.push(episode);
    });

    brand.stars = new StarListRepsonseModel(Object.keys(stars).length, Object.values(stars).map((star) => {
        const model = { ...star.star };
        model.episodes = new EpisodeListResponseModel(star.episodes.length, star.episodes);
        return model;
    }));

    const populatedBrand = await _getPopulatedBrand(brand, [], {
        [parameterTypeEnum.types.USERID.key]: parameters.userId
    });

    if (populatedBrand.videoIds) {
        populatedBrand.video = `https://player.zype.com/embed/${populatedBrand.videoIds[0]}.html?api_key=${zypeConfig.readOnly}`;
        populatedBrand.zypeVideo = populatedBrand.videoIds[0];
    }

    return new BrandResponseModel(populatedBrand);
};

/**
 * Returns the list of brands
 *
 * @param {Number} [offset=0] Number to offset list of brands
 * @param {Number} [limit=20] Total number of brands to return
 * @param parameters
 * @returns {Promise.<BrandListResponseModel>}
 */
Service.prototype.getBrands = async function (offset, limit, parameters = {}) {
    const { total, brands } = await indexService.searchData('*', {
        types: ['brand']
    }, offset, limit,
        [
            { order: { order: 'asc', missing: "_last", unmapped_type: "long" } },
            { 'slug.keyword': { order: "asc", missing: "_last", unmapped_type: "string" } },
        ]);

    const populatedBrands = await _getPopulatedBrands(brands, [], {
        [parameterTypeEnum.types.USERID.key]: parameters.userId
    });

    return new BrandListResponseModel(total, populatedBrands);
};

/**
 * Returns the brand matching the provided slug
 *
 * @param {String} slug Brand slug
 * @param parameters
 * @returns {Promise.<BrandResponseModel>}
 * @throws NotFoundErrorModel if no brand was found
 */
Service.prototype.getBrandBySlug = async function (slug, parameters) {
    return getBrandByProperty('slug', slug, parameters);
};

/**
 * Returns the brand matching the provided ID
 *
 * @param {Number} id Brand ID
 * @param parameters
 * @returns {Promise.<BrandResponseModel>}
 * @throws NotFoundErrorModel if no brand was found
 */
Service.prototype.getBrandById = async function (id, parameters) {
    return getBrandByProperty('id', id, parameters);
};

/**
 * Returns the brands matching the provided IDs
 *
 * @param {Number[]} ids Brand IDs
 * @param parameters
 * @returns {Promise.<BrandListResponseModel>}
 */
Service.prototype.getBrandsByIds = async function (ids, parameters = {}) {
    const { total, brands } = await indexService.searchData(
        undefined,
        {
            types: ['brand'],
            filters: [
                {
                    fields: ['id'],
                    query: ids.join(' OR ')
                }
            ]
        }
    );

    const populatedBrands = await _getPopulatedBrands(brands, [], {
        [parameterTypeEnum.types.USERID.key]: parameters.userId
    });

    return new BrandListResponseModel(total, populatedBrands);
};

Service.prototype.getStarsByBrandSlug = async function (slug, parameters) {
    slug = (slug) ? slug.toLowerCase() : '';
    parameters = parameters || {};
    let brand = await brandDao.getBrandBySlug(slug);
    if (!brand) {
        throw new NotFoundErrorModel('No brand found matching slug ' + slug);
    }
};

Service.prototype.getBrandsSirqul = async function (offset, limit, parameters = {}) {
    return sirqulService.getEntitiesPromise(entityType, offset, limit, parameters, "ALBUM_TITLE", "false")
        .then((sirqulEntities)=>{
            if(sirqulEntities){
                return new BrandListResponseModel(sirqulEntities.countTotal, sirqulEntities.items, true, "album");
            }
            return null;
        });
};

Service.prototype.getBrandBySlugSirqul = async function (slug, parameters) {
    return sirqulService.getEntityBySlug(entityType, slug, parameters)
        .then((data)=>{
            if(data){
                let result = new BrandResponseModel(data, true, "album");
                return result;
            }
            return null;
        });
};

Service.prototype.getBrandByIdSirqul = async function (id, parameters) {
    return sirqulService.getEntityById(entityType, id, parameters)
        .then((data)=>{
            if(data){
                let result = new BrandResponseModel(data, true, "album");
                return result;
            }
            return null;
        });
};

module.exports = new Service();