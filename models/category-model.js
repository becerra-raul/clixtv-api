let apiUtils = require('../utils/api-utils');

function CategoryModel(data) {
    if (!data) {
        return;
    }
    this.id = data.id;
    this.name = data.name;
    this.slug = data.slug;
    this.thumbnail = apiUtils.getImagePath() + data.thumbnail;
    this.cover = apiUtils.getImagePath() + data.cover;

    if (data.episodes) {
        this.episodes = data.episodes;
    } else {
        this.totalEpisodes = data.total_episodes;
    }
}

module.exports = CategoryModel;