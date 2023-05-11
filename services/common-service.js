const ApiResponseModel = require('../models/api-response-model');
const sirqulService = require('../services/sirqul-service');
const request = require("request-promise-native");

function Service() {
    //
 }

Service.prototype.getURLResponse = async function (url) {
    const apiResult = await request(url, { method: 'GET' });
    console.log("apiResult::", apiResult);
    return apiResult;
}

Service.prototype.getAssets = async function (query) {
    const queryParams = {
        accountId: query.userId,
        assetIds: query.assetIds,
        albumIds: query.albumIds,
        mediaType: query.mediaType,
        start: Number(query.start || 0),
        limit: Number(query.limit || 25)
    }
    const assetResult = await sirqulService.makePostRequestPromise('/asset/search', queryParams, true, false);
    const dto = new ApiResponseModel(assetResult);
    dto.items = assetResult.items;
    return dto;
}

module.exports = new Service();