const requestPromise = require('request-promise-native');
const ApiResponseModel = require('../models/api-response-model');
const apiUtils = require('../utils/api-utils');
const sirquelService = require('./sirqul-service');
const userService = require('./user-service');



function Service() {
    //
}


Service.prototype.createAlbumInvite = async function (payload) {
    const formData = {
        accountId: payload.userId,
        albumId: payload.albumId
    }
    const apiResult = await sirquelService.makePostRequestPromise('/invite/album', formData, true, false);
    const dto = new ApiResponseModel(apiResult);
    dto.item = apiResult;
    return dto;
}

Service.prototype.createGameLevelInvite = async function (payload) {
    const formData = {
        accountId: payload.userId,
        gameLevelId: payload.gameLevelId
    }
    const apiResult = await sirquelService.makePostRequestPromise('/invite/gameLevel', formData, true, false);
    const dto = new ApiResponseModel(apiResult);
    dto.item = apiResult;
    if (dto.valid && payload.useAmbassador) {
        const ambassadorResult = await this.createOrGetAmbassador({ userId: payload.userId, token: dto.item.token });
        if (ambassadorResult.item) {
            dto.item.token = ambassadorResult.item.token;
        }
    }
    return dto;
}

Service.prototype.createContestInvite = async function (payload) {
    const formData = {
        accountId: payload.userId,
        albumContestId: payload.contestId
    }
    const apiResult = await sirquelService.makePostRequestPromise('/invite/albumContest', formData, true, false);
    const dto = new ApiResponseModel(apiResult);
    dto.item = apiResult;
    if (dto.valid && payload.useAmbassador) {
        const ambassadorResult = await this.createOrGetAmbassador({ userId: payload.userId, token: dto.item.token });
        if (ambassadorResult.item) {
            dto.item.token = ambassadorResult.item.token;
        }
    }
    return dto;
}

Service.prototype.getIniviteDetail = async function (query) {
    const formData = {
        accountId: query.accountId,
        token: query.token
    }
    const apiResult = await sirquelService.makePostRequestPromise('/invite/get', formData, true, false);
    const dto = new ApiResponseModel(apiResult);
    if (dto.valid) {
        dto.item = apiResult;
    }
    return dto;
}

Service.prototype.createOrGetAmbassador = async function ({ userId, token }) {
    const userInfo = await userService.getSirqulUser(userId);
    const config = apiUtils.getAmbassadorConfig();
    const apiPath = config.baseUrl + '/' + config.username + '/' + config.token + '/json/ambassador/get';
    const nameParts = (userInfo.name || '').split(' ');
    let firstName = userInfo.firstName || nameParts[0] || '', lastName = userInfo.lastName || nameParts[1] || '';
    const qs = {
        email: userInfo.email,
        auto_create: 1,
        first_name: firstName,
        last_name: lastName,
        add_to_group_id: 1,
        email_new_ambassador: 0,
        custom1: token || ''
    }
    const apiResult = await requestPromise.get(apiPath, { useQuerystring: true, qs });
    const resBody = JSON.parse(apiResult);
    let dto = new ApiResponseModel({ valid: false, message: resBody.response.message });
    if (resBody.response && resBody.response.code === "200") {
        dto = new ApiResponseModel({ valid: true, message: resBody.response.message });
        dto.item = { rawData: resBody.response.data };
        const { ambassador } = resBody.response.data;
        const name = ((ambassador.first_name || '') + ' ' + (ambassador.last_name || '')).trim();
        let token;
        if (ambassador.memorable_url) {
            const urlParts = ambassador.memorable_url.split("/");
            token = urlParts[urlParts.length - 1];
        }
        dto.item.inviteText = name + ' has invited you to be their content!';
        dto.item.token = token;
    }
    return dto;
}

module.exports = new Service();