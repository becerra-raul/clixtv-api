const StarIndexModel = require('./star-index-model');
const StarListIndexModel = require('./star-list-index-model');

function EpisodeIndexModel(episode = {}) {
    const { pictures = [] } = episode;
    const thumbnail = pictures.find(p => p.title === 'thumb');
    const endPhoto = pictures.find(p => p.title === 'end');
    const carouselPhoto = pictures.find(p => p.title === 'carousel');

    this.id = episode._id || episode.id;

    this.title = episode.title;
    this.description = episode.description;
    this.slug = episode.friendly_title;
    this.enabled = episode.active === true;
    this.episodeNumber = episode.episode_number || 1;
    //this.order = episode.order || 0; This line makes ES re-index fails

    if (episode.categoryIds) {
        this.categoryIds = episode.categoryIds;
    }
    if (thumbnail) {
        this.thumbnailPhoto = thumbnail.url;
    }
    if (endPhoto) {
        this.endPhoto = endPhoto.url;
    }

    if (carouselPhoto) {
        this.carouselPhoto = carouselPhoto.url;
    }

    if (episode.series) {
        this.series = episode.series;
    }

    if (episode.brands) {
        this.brands = episode.brands;
    }

    if (episode.charity) {
        this.charity = episode.charity;
    }
    if (episode.charities) {
        this.charities = episode.charities;
    }

    if (episode.star && (episode.star instanceof StarIndexModel)) {
        this.star = episode.star;
    }
    if (episode.stars && (episode.stars instanceof StarListIndexModel)) {
        this.stars = episode.stars;
    }
    if (episode.video_ids) {
        this.videoIds = episode.video_ids;
    }

    if (episode.social_like) {
        this.socialLikes = episode.social_like;
    }

    if (episode.social_view) {
        this.socialViews = episode.social_view;
    }

    if (episode.created_at) {
        this.createdAt = episode.created_at;
    }

    if (episode.order_category) {
        this.order_category = episode.order_category;
    }
    if (episode.rating) {
        this.rating = episode.rating;
    }
    if (episode.external_link) {
      this.externalLink = episode.external_link;
    }
}

module.exports = EpisodeIndexModel;