function SeriesIndexModel(series) {
    this.id = series._id;
    this.title = series.title;
    this.slug = series.friendly_title;
    if (series.brands) {
        this.brands = series.brands;
    }
    if (series.episodes) {
        this.episodes = series.episodes;
    }
    if (series.charities) {
        this.charities = series.charities;
    }
    // if (episode.stars) {
    //     this.stars = episode.stars;
    // }
}

module.exports = SeriesIndexModel;