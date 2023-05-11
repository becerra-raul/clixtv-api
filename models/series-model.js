function SeriesModel(data) {
    if (!data) {
        return;
    }
    this.id = data.id;
    this.name = data.name;
    this.slug = data.slug;
    this.brands = data.brands;
    this.charities = data.charities;
    this.episodes = data.episodes;
}

module.exports = SeriesModel;