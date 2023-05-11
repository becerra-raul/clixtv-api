let apiUtils = require('../utils/api-utils');

function EpisodeModel(data) {
    if (!data) {
        return;
    }
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.episode = data.episode;
    this.slug = data.slug;
    this.coverAsset = data.coverAsset;
    if (data.thumbnail && data.thumbnail.startsWith('http')) {
        this.thumbnail = data.thumbnail;
    } else {
        this.thumbnail = apiUtils.getImagePath() + data.thumbnail;
    }

    if (data.video && data.video.startsWith('http')) {
        this.video = data.video;
    } else {
        this.video = apiUtils.getVideoPath() + data.video;
    }

    this.series = data.series;
    this.star = data.star;
    this.brands = data.brands;
    this.charity = data.charity;
    this.categories = data.categories;
    this.tags = data.tags;
    this.relatedVideos = data.relatedVideos;
}

module.exports = EpisodeModel;