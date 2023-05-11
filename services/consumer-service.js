const sirquelService = require('./sirqul-service');
const ConnectionListResponseModel = require('../models/consumer/connection-list-response-model');
const ApiResponseModel = require('../models/api-response-model');
const UserResponseModel = require('../models/response/user-response-model');
const { getProfileResponseFilters } = require('../models/enum/api-query-enum');
const AlbumResponseModel = require('../models/response/album-response-model');
const albumService = require('./album-service');

function Service() {
    //
}

/**
 * @param {*} query query.filter can be can be FRIENDS, PENDING, FOLLOWER and FOLLOWING
 * @returns connections[]
 */
Service.prototype.getConnections = async function (query) {
    let path = '/consumer/connection/get';
    if (query.filter === 'REQUESTED') {
        path = '/consumer/connection/getRequested'
    }
    if (query.filter === 'FRIENDS') {
        query.filter = 'FRIENDS,EXCLUDE_THIRD_PARTY'
    }

    const formData = {
        accountId: query.userId,
        start: Number(query.start || 0),
        limit: Number(query.limit || 25),
        filter: query.filter,
        descending: Number(query.descending || 1)
    }
    const apiResult = await sirquelService.makePostRequestPromise(path, formData, true, false);
    return new ConnectionListResponseModel(apiResult);
}

/**
 * 
 * @param {*} payload, payload.status can be accept, reject, request and remove 
 * @returns 
 */
Service.prototype.updateFriendStatus = async function (payload) {
    const formData = {
        accountId: payload.userId,
        friendAccountId: payload.friendAccountId,
        notifyFriend: true,
    }
    const path = '/consumer/friend/' + payload.status;
    const apiResult = await sirquelService.makePostRequestPromise(path, formData, true, false);
    return new ApiResponseModel(apiResult);
}

Service.prototype.updateFollowStatus = async function (payload) {
    const formData = {
        accountId: payload.userId,
        connectionAccountId: payload.connectionAccountId,
        isFollowing: payload.isFollowing
    }
    const path = '/consumer/connection/add';
    const apiResult = await sirquelService.makePostRequestPromise(path, formData, true, false);
    return new ApiResponseModel(apiResult);
}

Service.prototype.getConsumerProfile = async function (query) {
    const formData = {
        accountId: query.userId,
        connectionAccountId: query.consumerAccountId,
        responseFilters: getProfileResponseFilters.ACCOUNT_OVERVIEW
    }
    const path = '/consumer/profile/get';
    const apiResult = await sirquelService.makePostRequestPromise(path, formData, true, true);
    return new UserResponseModel(apiResult, true);
}

Service.prototype.getConsumerAlbum = async function (query) {
    const formData = {
        accountId: query.userId,
        albumId: query.albumId
    }
    const apiResult = await sirquelService.makePostRequestPromise('/consumer/album/get', formData, true, false);
    const dto = new ApiResponseModel(apiResult);
    if (dto.valid) {        
        dto.item = new AlbumResponseModel(apiResult);
        if (query.includes && query.includes.includes('albums')) {
            const { metaData } = dto.item;
            if (metaData && metaData.list) {
                let albumIds = metaData.list;
                if (Array.isArray(metaData.list)) {
                    albumIds = metaData.list.join(',');
                }
                const associatedAlbums = await albumService.search({ loggedInUserId: query.userId, albumIds });
                if (associatedAlbums.valid) {
                    dto.item.albums = associatedAlbums.items;
                }
            }
        }
    }
    return dto;
}

Service.prototype.saveConsumerAlbum = async function (payload) {
    const formData = {
        visibility: 'PUBLIC',
        ...payload,
        accountId: payload.userId,
        title: payload.title,
        description: payload.description,
        categoryIds: payload.categoryIds,
        metaData: JSON.stringify(payload.metaData || {}),
        categoryFilterIds: parseInt(sirqulProdConfigs.appConfigVersion || 0) || undefined
    }
    let path;
    if (payload.albumId) {
        path = '/consumer/album/update'
        formData.albumId = payload.albumId
    } else {
        formData.albumType = payload.albumType
        formData.publicAdd = true
        formData.publicDelete = false
        formData.publicRead = true
        formData.publicWrite = true
        path = '/consumer/album/add';
    }
    const apiResult = await sirquelService.makePostRequestPromise(path, formData, true, false);
    const dto = new ApiResponseModel(apiResult);
    dto.item = apiResult;
    return dto;
}

Service.prototype.removeConsumerAlbum = async function (payload) {
    const formData = {
        accountId: payload.userId,
        albumId: payload.albumId
    }
    const apiResult = await sirquelService.makePostRequestPromise('/consumer/album/remove', formData, true, false);
    return new ApiResponseModel(apiResult);
}

module.exports = new Service();