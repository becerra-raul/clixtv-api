const sirquelService = require('./sirqul-service')
const { RankingApiResponseModel } = require('../models/response/leaderboard-ranking/ranking-api-response-model')



function Service() {
    //
 }


Service.prototype.getRankingResults = async function (query) {
    const formData = {
        accountId: query.userId,
        rankType: query.rankType || 'BADGE_POINTS',
        returnUserRank: 1,
        leaderboardMode: 'GLOBAL',
        start: Number(query.start || 0),
        limit: Number(query.limit || 25),
        descending: Number(query.descending || 1),
        sortField: query.sortField || 'TOTAL',
        startDate: Number(query.startDate || 0),
        endDate: Number(query.endDate || 0)
    }
    let path = '/ranking/search';
    if (formData.startDate > 0 || formData.endDate > 0) {
        path = '/ranking/historical/search';
    }
    const apiResult = await sirquelService.makePostRequestPromise(path, formData, true, false)
    return new RankingApiResponseModel(apiResult, formData.rankType)
};

module.exports = new Service();