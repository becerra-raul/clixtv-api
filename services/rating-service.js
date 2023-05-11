const ApiResponseModel = require('../models/api-response-model');
const sirquelService = require('./sirqul-service')


function Service() {
    //
 }


Service.prototype.saveRating = async function (payload) {
    
    const formData = {
        accountId: payload.userId,
        ratableId: payload.ratableId,
        ratingValue: payload.ratingValue,
        ratableType: payload.ratableType
    }
    let path = '/rating/create';
    if (payload.ratingId) {
        path = '/rating/update';
        formData.ratingId = payload.ratingId;
    }
    const apiResult = await sirquelService.makePostRequestPromise(path, formData, true, false);
    const dto = new ApiResponseModel(apiResult);
    return dto;
    
}

module.exports = new Service();