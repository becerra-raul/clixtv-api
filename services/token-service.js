const { uuid } = require("uuidv4");
const paramUtils = require('../utils/parameter-utils');
const sirquelService = require('./sirqul-service')
const ApiResponseModel = require('../models/api-response-model');


function Service() {
    //
}


Service.prototype.createToken = async function (payload) {
    const formData = {
        accountId: payload.userId,
        signinOnlyMode: payload.login || false,
        networkUID: 'PHONE_V2',
        thirdPartyId: uuid(),
        thirdPartyName: payload.tokenFor,
        thirdPartyToken: payload.tokenFor,
    }
    const apiResult = await sirquelService.makePostRequestPromise('/thirdparty/credential/create', formData, true, false);
    const dto = new ApiResponseModel(apiResult);
    if (apiResult.valid) {
        dto.item = { tokenId: apiResult.thirdPartyCredential.thirdPartyCredentialId };
    }
    return dto;
}

Service.prototype.resendToken = async function (payload) {
    const formData = {
        networkUID: 'PHONE_V2',
        thirdPartyToken: payload.tokenFor,
        thirdPartyCredentialId: payload.tokenId
    }
    const apiResult = await sirquelService.makePostRequestPromise('/thirdparty/credential/mfa/send', formData, true, false);
    return new ApiResponseModel(apiResult);
}

Service.prototype.verifyToken = async function (payload) {
    const formData = {
        accountId: payload.userId,
        networkUID: 'PHONE_V2',
        thirdPartyCredentialId: payload.tokenId,
        thirdPartyToken: payload.tokenFor,
        thirdPartySecret: payload.secret
    }
    const apiResult = await sirquelService.makePostRequestPromise('/thirdparty/credential/get', formData, true, false)
    // const dto = new ApiResponseModel(apiResult);
    const dto = apiResult;
    if (!dto.valid) {
        // @note: API will return 1051 in case of phone number not linked to account 
        if (['1051'].includes(apiResult.errorCode)) {
            dto.valid = true;
            dto.message = "Successfully verified!"
        }
    }
    return dto;
}

Service.prototype.searchTokens = async function (query) {
    const formData = {
        accountId: query.userId,
        keyword: query.keyword,
        networkUID: query.networkUID,
        start: Number(query.start || 0),
        limit: Number(query.limit || 10),
        descending: paramUtils.isBoolean(query.descending) ? paramUtils.getBoolean(query.descending) : true,
    }
    const apiResult = await sirquelService.makePostRequestPromise('/thirdparty/credential/search', formData, true, false)
    const dto = new ApiResponseModel(apiResult);
    dto.items = apiResult.items;
    return dto;
}

module.exports = new Service();