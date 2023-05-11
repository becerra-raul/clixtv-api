function FavoriteResponseModel(data) {
    this.albumType = data.albumType;
    this.title = data.title;
    if (data.coverAsset) {
        this.thumbnailURL = data.coverAsset.thumbnailURL;
        this.fullURL = data.coverAsset.fullURL;
    }
    this.visibility = data.visibility;
    this.likeCount = data.likeCount;
    this.commentsCount = data.commentsCount;
    this.favorite = data.favorite;
    this.sharedCount = data.sharedCount;
    this.active = data.active;
    this.customCount = data.customCount;
    if (data.metaData) {
        const metaData = JSON.parse(data.metaData);
        this.totalEpisodes = metaData.total_episodes;
        this.episodeNumber = metaData.episode_number;
    }
}

module.exports = FavoriteResponseModel;