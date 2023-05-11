const ApiResponseModel = require('../models/api-response-model');
const FavoriteResponseModel = require('../models/response/favorite-response-model');
const favoriteDao = require('../persistence/favorite-dao'),
    entityTypeEnum = require('../models/enum/entity-type-enum'),
    categoryService = require('./category-service'),
    starService = require('./star-service'),
    brandService = require('./brand-service'),
    charityService = require('./charity-service'),
    offerService = require('./offer-service'),
    episodeService = require('./episode-service'),
    InvalidRequestErrorModel = require('../models/invalid-request-error-model');

const sirqulService = require('./sirqul-service');


function Service() {
    /**
     * favoritableType: OFFER, OFFER_LOCATION, RETAILER_LOCATION, CATEGORY, ALBUM 
     */
}

async function _updateFavorite(userId, entityId, entityType, enabled) {
    let data = await favoriteDao.updateFavorite(userId, entityId, entityType, new Date(), enabled);
    if (!data || !data.insertId) {
        console.warn('Error adding favorite', data);
        throw new Error('Error adding favorite');
    }
    return {
        success: true
    }
}

async function _getFavorites(userId, entityType, offset, limit) {
    return await favoriteDao.getUserFavoritesByType(userId, entityType, offset, limit);
}

async function _getTotalFavorites(userId, entityType) {
    return await favoriteDao.getTotalUserFavoritesByType(userId, entityType);
}

async function _sirqulAddOrRemoveFavorite(payload, isAdd) {
    const path = isAdd ? '/favorite/create' : '/favorite/delete';
    const formData = {
        accountId: payload.userId,
        favoritableId: payload.favoritableId,
        favoritableType: payload.favoritableType || 'ALBUM'
    }
    const apiResult = await sirqulService.makePostRequestPromise(path, formData, true, false);
    return new ApiResponseModel(apiResult);
}

Service.prototype.addFavoriteEpisode = async function(userId, entityId) {
    return await _updateFavorite(userId, entityId, entityTypeEnum.types.EPISODE, true);
};

Service.prototype.addFavoriteSocialEpisode = async function(userId, entityId) {
    return await _updateFavorite(userId, entityId, entityTypeEnum.types.EPISODE_SOCIAL, true);
};

Service.prototype.addFavoriteOffer = async function(userId, entityId) {
    return await _updateFavorite(userId, entityId, entityTypeEnum.types.OFFER, true);
};

Service.prototype.addFavoriteBrand = async function(userId, entityId) {
    return await _updateFavorite(userId, entityId, entityTypeEnum.types.BRAND, true);
};

Service.prototype.addFavoriteCharity = async function(userId, entityId) {
    return await _updateFavorite(userId, entityId, entityTypeEnum.types.CHARITY, true);
};

Service.prototype.addFavoriteStar = async function(userId, entityId) {
    return await _updateFavorite(userId, entityId, entityTypeEnum.types.STAR, true);
};

Service.prototype.addFavoriteCategory = async function(userId, entityId) {
    return await _updateFavorite(userId, entityId, entityTypeEnum.types.CATEGORY, true);
};

Service.prototype.removeFavoriteEpisode = async function(userId, entityId) {
    return await _updateFavorite(userId, entityId, entityTypeEnum.types.EPISODE, false);
};

Service.prototype.removeFavoriteOffer = async function(userId, entityId) {
    return await _updateFavorite(userId, entityId, entityTypeEnum.types.OFFER, false);
};

Service.prototype.removeFavoriteBrand = async function(userId, entityId) {
    return await _updateFavorite(userId, entityId, entityTypeEnum.types.BRAND, false);
};

Service.prototype.removeFavoriteCharity = async function(userId, entityId) {
    return await _updateFavorite(userId, entityId, entityTypeEnum.types.CHARITY, false);
};

Service.prototype.removeFavoriteStar = async function(userId, entityId) {
    return await _updateFavorite(userId, entityId, entityTypeEnum.types.STAR, false);
};

Service.prototype.removeFavoriteCategory = async function(userId, entityId) {
    return await _updateFavorite(userId, entityId, entityTypeEnum.types.CATEGORY, false);
};

Service.prototype.removeFavoriteSocialEpisode = async function(userId, entityId) {
    return await _updateFavorite(userId, entityId, entityTypeEnum.types.EPISODE_SOCIAL, false);
};

Service.prototype.getUserFavoriteEpisodes = async function(userId, offset, limit) {
    let data = await Promise.all(
        [
            _getTotalFavorites(userId, entityTypeEnum.types.EPISODE),
            _getFavorites(userId, entityTypeEnum.types.EPISODE, offset, limit)
        ]
    );

    let episodes = await episodeService.getEpisodesByIds(data[1].map((favorite) => {
        return favorite.entity_id;
    }));

    episodes.total = data[0];
    episodes.episodes = episodes.episodes.map((episode) => {
        episode.isFavorite = true;
        return episode;
    });
    return episodes;
};

Service.prototype.getUserFavoriteOffers = async function(userId, offset, limit) {
    let data = await Promise.all(
        [
            _getTotalFavorites(userId, entityTypeEnum.types.OFFER),
            _getFavorites(userId, entityTypeEnum.types.OFFER, offset, limit)
        ]
    );

    let offers = await offerService.getOffersByIds(data[1].map((favorite) => {
        return favorite.entity_id;
    }));

    offers.total = data[0];
    offers.offers = offers.offers.map((offer) => {
        offer.isFavorite = true;
        return offer;
    });
    return offers;
};

Service.prototype.getUserFavoriteBrands = async function(userId, offset, limit) {
    let data = await Promise.all(
        [
            _getTotalFavorites(userId, entityTypeEnum.types.BRAND),
            _getFavorites(userId, entityTypeEnum.types.BRAND, offset, limit)
        ]
    );

    let brands = await brandService.getBrandsByIds(data[1].map((favorite) => {
        return favorite.entity_id;
    }));

    brands.total = data[0];
    brands.brands = brands.brands.map((brand) => {
        delete brand.stars;
        delete brand.episodes;
        brand.isFavorite = true;
        return brand;
    });
    return brands;
};

Service.prototype.getUserFavoriteCharities = async function(userId, offset, limit) {
    let data = await Promise.all(
        [
            _getTotalFavorites(userId, entityTypeEnum.types.CHARITY),
            _getFavorites(userId, entityTypeEnum.types.CHARITY, offset, limit)
        ]
    );

    let charities = await charityService.getCharitiesByIds(data[1].map((favorite) => {
        return favorite.entity_id;
    }));

    charities.total = data[0];
    charities.charities = charities.charities.map((charity) => {
        delete charity.stars;
        charity.isFavorite = true;
        return charity;
    });
    return charities;
};

Service.prototype.getUserFavoriteStars = async function(userId, offset, limit) {
    let data = await Promise.all(
        [
            _getTotalFavorites(userId, entityTypeEnum.types.STAR),
            _getFavorites(userId, entityTypeEnum.types.STAR, offset, limit)
        ]
    );

    let stars = await starService.getStarsByIds(data[1].map((favorite) => {
        return favorite.entity_id;
    }));

    stars.total = data[0];
    stars.stars = stars.stars.map((star) => {
        star.totalVideos = star.episodes.total;
        delete star.episodes;
        delete star.series;
        delete star.brands;
        delete star.charities;
        delete star.offers;
        star.isFavorite = true;
        return star;
    });
    return stars;
};

Service.prototype.getUserFavoriteCategories = async function(userId, offset, limit) {
    let data = await Promise.all(
        [
            _getTotalFavorites(userId, entityTypeEnum.types.CATEGORY),
            _getFavorites(userId, entityTypeEnum.types.CATEGORY, offset, limit)
        ]
    );

    let categories = await categoryService.getCategoriesByIds(data[1].map((favorite) => {
        return favorite.entity_id;
    }));

    categories.total = data[0];
    categories.categories = categories.categories.map((category) => {
        category.isFavorite = true;
        return category;
    });

    return categories;
};

Service.prototype.addFavorite = async function(userId, entityId, entityType) {
    switch (entityType) {
        case entityTypeEnum.types.EPISODE:
            return this.addFavoriteEpisode(userId, entityId);

        case entityTypeEnum.types.OFFER:
            return this.addFavoriteOffer(userId, entityId);

        case entityTypeEnum.types.BRAND:
            return this.addFavoriteBrand(userId, entityId);

        case entityTypeEnum.types.CHARITY:
            return this.addFavoriteCharity(userId, entityId);

        case entityTypeEnum.types.STAR:
            return this.addFavoriteStar(userId, entityId);

        case entityTypeEnum.types.CATEGORY:
            return this.addFavoriteCategory(userId, entityId);

        case entityTypeEnum.types.EPISODE_SOCIAL:
            return this.addFavoriteSocialEpisode(userId, entityId);
    }
    throw new InvalidRequestErrorModel('Invalid entity type: ' + entityType);
};

Service.prototype.removeFavorite = async function(userId, entityId, entityType) {
    switch (entityType) {
        case entityTypeEnum.types.EPISODE:
            return this.removeFavoriteEpisode(userId, entityId);

        case entityTypeEnum.types.OFFER:
            return this.removeFavoriteOffer(userId, entityId);

        case entityTypeEnum.types.BRAND:
            return this.removeFavoriteBrand(userId, entityId);

        case entityTypeEnum.types.CHARITY:
            return this.removeFavoriteCharity(userId, entityId);

        case entityTypeEnum.types.STAR:
            return this.removeFavoriteStar(userId, entityId);

        case entityTypeEnum.types.CATEGORY:
            return this.removeFavoriteCategory(userId, entityId);

        case entityTypeEnum.types.EPISODE_SOCIAL:
            return this.removeFavoriteSocialEpisode(userId, entityId);
    }
    throw new InvalidRequestErrorModel('Invalid entity type: ' + entityType);
};

Service.prototype.getFavorites = async function(userId, entityType, offset, limit) {
    switch (entityType) {
        case entityTypeEnum.types.EPISODE:
            return this.getUserFavoriteEpisodes(userId, offset, limit);

        case entityTypeEnum.types.OFFER:
            return this.getUserFavoriteOffers(userId, offset, limit);

        case entityTypeEnum.types.BRAND:
            return this.getUserFavoriteBrands(userId, offset, limit);

        case entityTypeEnum.types.CHARITY:
            return this.getUserFavoriteCharities(userId, offset, limit);

        case entityTypeEnum.types.STAR:
            return this.getUserFavoriteStars(userId, offset, limit);

        case entityTypeEnum.types.CATEGORY:
            return this.getUserFavoriteCategories(userId, offset, limit);
    }
    throw new InvalidRequestErrorModel('Invalid entity type: ' + entityType);
};


Service.prototype.sirqulAddFavorite = async function (payload) {
    return _sirqulAddOrRemoveFavorite(payload, true);
}

Service.prototype.sirqulRemoveFavorite = async function (payload) {
    return _sirqulAddOrRemoveFavorite(payload, false);
}

Service.prototype.sirqulGetFavorites = async function (query) {
    const formData = {
        accountId: query.userId,
        start: query.start,
        limit: query.limit,
        favoritableType: query.favoritableType || 'ALBUM',
        returnFullRespone: false,
    }
    const apiResult = await sirqulService.makePostRequestPromise('/favorite/search', formData, true, false);
    const { valid, message, hasMoreResults, items = []} = apiResult;
    return ({
        valid,
        message,
        hasMoreResults,
        items: items.map(item => new FavoriteResponseModel(item))
    });
}

Service.prototype.sirqulGetFavorite = async function (query) {
    const formData = {
        accountId: query.userId,
        favoritableId: query.favoritableId,
        favoritableType: query.favoritableType || 'ALBUM',
        limit: 1,
    }
    const apiResult = await sirqulService.makePostRequestPromise('/favorite/whois', formData, true, false);
    const { valid, message, favorited = false } = apiResult;
    return ({valid, message, data: { favorited }});
}

module.exports = new Service();