const { RankModel } = require("./rank-model");

function RankingApiResponseModel(data, rankType = "BADGE_POINTS") {
    this.valid = data.valid
    this.message = data.message
    if (data.valid && Array.isArray(data.rankings)) {
        const ranking = data.rankings.find(rInfo => rInfo.rankType === rankType)
        if (ranking) {            
            this.data = {
                items: ranking.items.map(item => new RankModel(item)),
                userRank: ranking.userRank && new RankModel(ranking.userRank),
                hasMoreResults: ranking.hasMoreResults,
                count: ranking.count,
                start: ranking.start,
                limit: ranking.limit
            }
        }
    }
}
module.exports = { RankingApiResponseModel };