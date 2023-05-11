function AlbumResponseModel(data) {
    this.id = data.albumId;
    this.albumId = data.albumId;
    this.albumType = data.albumType;
    this.title = data.title;
    this.description = data.description;
    this.slug = data.subType;
    const linkedObjectResponse = JSON.parse(data.linkedObjectResponse || '{}');
    const coverAsset = data.coverAsset || linkedObjectResponse.coverAsset;
    this.coverAsset = coverAsset;
    if (coverAsset) {
        this.thumbnailURL = coverAsset.thumbnailURL;
        this.fullURL = coverAsset.fullURL;
        this.coverURL = coverAsset.coverURL;
    }
    if (data.albumType == 'activity') {
        data.categories = linkedObjectResponse.categories;
        this.slug = linkedObjectResponse.subType;
        this.linkedObjectAlbumType = linkedObjectResponse.albumType;
        this.linkedObjectId = data.linkedObjectId;
        this.linkedObjectType = data.linkedObjectType;
    }
    this.visibility = data.visibility;
    this.liked = data.liked;
    this.favorite = data.favorite;
    this.likeCount = data.likeCount;
    this.favoriteCount = data.favoriteCount;
    this.sharedCount = data.sharedCount;
    this.commentsCount = data.commentsCount;
    this.viewedCount = data.viewedCount;
    this.customCount = data.customCount;
    this.clickedCount = data.clickedCount;
    this.hasRatings = data.hasRatings;
    this.overallRating = data.overallRating;
    this.userRating = data.userRating;
    this.active = data.active;
    this.owner = data.owner;
    if (data.metaData) {
        const metaData = JSON.parse(data.metaData);
        this.metaData = metaData;
        this.totalEpisodes = metaData.total_episodes;
        this.episodeNumber = metaData.episode_number;
        this.brandIds = metaData.brand_ids;
        this.charityIds = metaData.charity_ids;
        if(!this.description) this.description = metaData.description;
    }
    if (Array.isArray(data.categories)) {
        this.categoryIds = data.categories.map(cat => cat.categoryId).join(',');
        const starInfo = data.categories.find(cat => cat.parentName.startsWith('Star'));
        if (starInfo) {
            const starMetaData = JSON.parse(starInfo.metaData);
            this.starId = starMetaData.sirqul_audience_id;
            this.starName = starInfo.name;
            this.starSlug = starMetaData.friendly_title;
            if(starInfo.asset) this.starThumbnailURL = starInfo.asset.thumbnailURL;
        }
        const seriesInfo = data.categories.find(cat => cat.parentName.startsWith("Series"));
        if (seriesInfo) {
            const seriesMetaData = JSON.parse(seriesInfo.metaData);
            this.seriesId = seriesMetaData.sirqul_album_id;
            this.seriesTitle = seriesMetaData.title || seriesMetaData.name;
            this.seriesSlug = seriesMetaData.friendly_title;
            this.seriesThumbnailURL = seriesMetaData.thumb_photo;
        }
    }
    this.dateCreated = data.dateCreated;
    this.dateUpdated = data.dateUpdated;
}

module.exports = AlbumResponseModel;