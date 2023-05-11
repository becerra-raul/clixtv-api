const ApiResponseModel = require('../models/api-response-model');
const NoteResponseModel = require('../models/response/note-response-model');
const sirquelService = require('./sirqul-service')
const paramUtils = require('../utils/parameter-utils');

function Service() {
    //
 }

Service.prototype.save = async function (payload) {
    const formData = {
        accountId: payload.userId,
        notableId: payload.notableId,
        notableType: payload.notableType,
        comment: payload.comment
    }
    let path = '/note/create';
    if (payload.noteId) {
        path = '/note/update';
        formData.noteId = payload.noteId;
    }
    const apiResult = await sirquelService.makePostRequestPromise(path, formData, true, false);
    const dto = new ApiResponseModel(apiResult);
    dto.item = apiResult;
    return dto;
}

Service.prototype.search = async function (query) {
    const queryParams = {
        accountId: query.userId,
        notableId: query.notableId,
        notableType: query.notableType,
        start: Number(query.start || 0),
        limit: Number(query.limit || 5),
        descending: paramUtils.isBoolean(query.descending) ? paramUtils.getBoolean(query.descending) : true,
        sortField: query.sortField
    }
    const apiResult = await sirquelService.makePostRequestPromise('/note/search', queryParams, true, false);
    return new ApiResponseModel(apiResult, NoteResponseModel);
}

Service.prototype.delete = async function (payload) {
    const formData = {
        accountId: payload.userId,
        noteId: payload.noteId
    }
    const apiResult = await sirquelService.makePostRequestPromise('/note/delete', formData, true, false);
    return new ApiResponseModel(apiResult);
}

module.exports = new Service();