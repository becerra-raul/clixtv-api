let apiUtils = require('../utils/api-utils');

function OfferModel(data) {
    if (!data) {
        return;
    }
    this.id = data.id;
    this.name = data.name;
    this.slug = data.slug;
    this.description = data.description;
    this.brand = data.brand;
    this.expire = data.expire;
    this.thumbnail = apiUtils.getImagePath() + data.thumbnail;
    this.cover = apiUtils.getImagePath() + data.cover;
    this.image1 = apiUtils.getImagePath() + data.image_1;
    this.relatedOffers = data.relatedOffers;
    this.episodes = data.episodes;



}

module.exports = OfferModel;