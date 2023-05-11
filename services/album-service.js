const ApiResponseModel = require('../models/api-response-model');
const AlbumResponseModel = require('../models/response/album-response-model');
const BrandResponseModel = require('../models/response/brand-response-model');
const CategoryResponseModel = require('../models/response/category-response-model');
const CharityResponseModel = require('../models/response/charity-response-model');
const EpisodeResponseModel = require('../models/response/episode-response-model');
const StarResponseModel = require('../models/response/star-response-model');
const sirquelService = require('./sirqul-service')
const paramUtils = require('../utils/parameter-utils');
function Service() {
    //
}

function _mapAlbumItems(items) {
    return items.map(item => {
        switch (item.albumType) {
            case 'episodes':
                return new EpisodeResponseModel(item, true);
            case 'category':
                return new CategoryResponseModel(item, true);
            case 'star':
                return new StarResponseModel(item, true);
            case 'brand':
                return new BrandResponseModel(item, true);
            case 'charities':
                return new CharityResponseModel(item, true);
            default:
                return new AlbumResponseModel(item);
        }
    })
}


Service.prototype.search = async function (query) {

    const formData = {
        accountId: query.loggedInUserId,
        albumIds: query.albumIds,
        audienceIds: query.audienceIds,
        categoryIds: query.categoryIds,
        subType: query.slug,
        albumType: query.albumType, // seasons, episodes, category, series, star, brand, charities 
        descending: paramUtils.isBoolean(query.descending) ? paramUtils.getBoolean(query.descending) : true,
        filter: query.filter, // FAVORITED, LIKED
        includeFavorited: true,
        includeLiked: true,
        includeRating: true,
        connectionAccountId: query.userId,
        sortField: query.sortField || 'ALBUM_CREATED', // ALBUM_CREATED, ALBUM_LIKES, ALBUM_NOTES
        keyword: query.keyword,
        start: Number(query.start || 0),
        limit: Number(query.limit || 10)
    }

    const devCacheId = sirquelService.getDevCacheId("album-search-", formData);

    if (!query.nocache) {
        if (sirqulProdConfigs.devCacheMode) {
            if (sirquelService.isDevCached(devCacheId)) return sirquelService.getDevCache(devCacheId);
        }
    }

    formData.categoryFilterIds = parseInt(sirqulProdConfigs.appConfigVersion || 0) || undefined;
    const apiResult = await sirquelService.makePostRequestPromise('/album/search', formData, true, !query.loggedInUserId);
    const dto = new ApiResponseModel(apiResult, AlbumResponseModel);
    if (query.strictMap) {
        dto.items = _mapAlbumItems(apiResult.items);
    }
    sirquelService.saveDevCache(devCacheId, dto);
    return dto;
}

Service.prototype.get = async function (query) {
    const formData = {
        accountId: query.userId,
        albumId: query.albumId,
    }
    const apiResult = await sirquelService.makePostRequestPromise('/album/get', formData, true, !query.accountId);
    const dto = new ApiResponseModel(apiResult, AlbumResponseModel);
    dto.item = apiResult;
    return dto;
}


module.exports = new Service();