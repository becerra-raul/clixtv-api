function CarouselIndexModel(carousel = {}) {

    this.id = carousel._id;
    this.title = carousel.title;
    this.slug = carousel.friendly_title;

    if (carousel.episodes) {
        this.episodes = carousel.episodes;
    }
}

module.exports = CarouselIndexModel;