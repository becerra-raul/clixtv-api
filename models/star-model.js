let apiUtils = require('../utils/api-utils');

function StarModel(data) {
    if (!data) {
        return;
    }
    this.id = data.id;
    this.name = data.name;
    this.slug = data.slug;
    this.thumbnail = apiUtils.getImagePath() + data.thumbnail;
    this.cover = apiUtils.getImagePath() + data.cover;
    this.episodes = data.episodes;
    this.brands = data.brands;
    this.offers = data.offers;
    this.charities = data.charities;
    this.series = data.series;
}

module.exports = StarModel;