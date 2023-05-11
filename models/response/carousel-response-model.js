function CarouselResponseModel(data) {
    this.id = data.id;
    this.title = data.title;
    this.slug = data.slug;

    if (data.episodes) {
        this.episodes = data.episodes;
    }
}

module.exports = CarouselResponseModel;