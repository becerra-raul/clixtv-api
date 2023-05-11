function RankModel(data) {
    if(!data) return
    if (data.owner) {        
        this.accountId = data.owner.accountId
        this.profileImage = data.owner.profileImage
        this.display = data.owner.display
        this.username = data.owner.username
        this.personalAudienceName = data.owner.personalAudienceName
    }
    this.rank = data.rank
    this.scoreValue  = data.scoreValue
}

module.exports = { RankModel };