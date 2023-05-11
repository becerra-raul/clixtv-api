const ApiResponseModel = require('../models/api-response-model');
const PackResponseModel = require('../models/response/pack-response-model');
const sirquelService = require('./sirqul-service')


function Service() {
    //
}

Service.prototype.packSearch = async function (query) {

    const formData = {
        accountId: query.userId,
        includeGameData: true,
        includeInactive: false,
        keyword: query.keyword,
        packType: query.packType || 'BUILTIN',
        start: Number(query.start || 0),
        limit: Number(query.limit || 10),
        descending: true
    }

    try {
        const app = await sirquelService.getApplication();
        formData.accountId = app.owner.accountId;
    } catch (error) {
        console.error("unable to fetch application detail::", error)
    }

    const devCacheId = sirquelService.getDevCacheId("pack-search-", formData);

    if (!query.nocache) {
        if (sirqulProdConfigs.devCacheMode) {
            if (sirquelService.isDevCached(devCacheId)) return sirquelService.getDevCache(devCacheId);
        }
    }

    const apiResult = await sirquelService.makePostRequestPromise('/pack/search', formData, true, false);
    const dto = new ApiResponseModel(apiResult, PackResponseModel);
    sirquelService.saveDevCache(devCacheId, dto);
    return dto;
}

Service.prototype.getPack = async function (query) {
    const formData = {
        accountId: query.userId,
        includeGameData: true,
        packId: query.packId
    }
    const apiResult = await sirquelService.makePostRequestPromise('/pack/get', formData, true, !formData.accountId);
    return new ApiResponseModel(apiResult, PackResponseModel);
}

Service.prototype.createScore = async function (payload) {
    const formData = {
        accountId: payload.userId,
        gameLevelId: payload.gameLevelId,
        gameObjectId: payload.gameObjectId,
        packId: payload.packId,
        points: payload.points,
        timeTaken: payload.timeTaken,
    }
    const apiResult = await sirquelService.makePostRequestPromise('/score/create', formData, true, false);
    const dto = new ApiResponseModel(apiResult);
    if (apiResult.item) {
        dto.item = {
            status: apiResult.item.status,
            ticketsEarned: apiResult.item.ticketsEarned,
        }
    }
    return dto;
}

Service.prototype.getTicketCount = async function (query) {
    const formData = {
        accountId: query.userId
    }
    const apiResult = await sirquelService.makePostRequestPromise('/ticket/count', formData, true, false);
    return ({ valid: apiResult.valid, message: apiResult.message, count: apiResult.count });
}

Service.prototype.getGameHint = async function (payload) {
    const formData = {
        accountId: payload.userId,
        actionType: 'REDEEMED',
        objectId: payload.objectId,
        purchaseType: 'SIRQUL',
        returnNulls: false,
        returnProfileResponse: false,
        ticketObjectType: 'GAME_OBJECT'
    }
    const apiResult = await sirquelService.makePostRequestPromise('/ticket/save', formData, true, false);
    const dto = new ApiResponseModel(apiResult);
    dto.item = apiResult;
    return dto;
}

module.exports = new Service();