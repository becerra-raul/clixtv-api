function FavoriteRequestModel(data) {
    this.userId = data.userId;
    this.entityId = data.entityId;
    this.entityType = data.entityType;
}

module.exports = FavoriteRequestModel;