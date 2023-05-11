const sirquelService = require('./sirqul-service');
const APIResponseModel = require('../models/api-response-model');

//#region helper functions
async function _addOrRemoveLike(payload, isAdd) {
    const path = isAdd ? '/like' : '/like/delete';
    const formData = {
        accountId: payload.userId,
        likableId: payload.likableId,
        likableType: payload.likableType || 'ALBUM' //ALBUM, ALBUM_CONTEST, ASSET, GAME_LEVEL, NOTE, THEME_DESCRIPTOR
    }
    const apiResult = await sirquelService.makePostRequestPromise(path, formData, true, false)
    return new APIResponseModel(apiResult);
}
//#endregion

function Service() {
    /**
     * likableType:: ALBUM, ALBUM_CONTEST, ASSET, GAME_LEVEL, NOTE, THEME_DESCRIPTOR
     */
 }

Service.prototype.add = async function (payload) {
    return _addOrRemoveLike(payload, true);
}

Service.prototype.remove = async function (payload) {
    return _addOrRemoveLike(payload, false);
}

module.exports = new Service();