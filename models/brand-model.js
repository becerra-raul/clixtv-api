let apiUtils = require('../utils/api-utils');

function BrandModel(data) {
    if (!data) {
        return;
    }
    this.id = data.id;
    this.name = data.name;
    this.slug = data.slug;
    this.description = data.description;
    this.thumbnail = apiUtils.getImagePath() + data.thumbnail;
    this.cover = apiUtils.getImagePath() + data.cover;
    if (data.video && data.video.startsWith('http')) {
        this.video = data.video;
    } else {
        this.video = apiUtils.getVideoPath() + data.video;
    }
    this.videoThumbnail = apiUtils.getImagePath() + data.video_thumbnail;
    this.offers = data.offers;
    this.stars = data.stars;
    this.episodes = data.episodes;
}

module.exports = BrandModel;