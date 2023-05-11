function StarIndexModel(star = {}) {

    const { pictures = [] } = star;
    const thumbnail = pictures.find(p => p.title === 'thumb');
    const coverPhoto = pictures.find(p => p.title === 'cover-photo');

    this.id = star._id;
    this.name = star.title;
    this.slug = star.friendly_title;
    this.enabled = star.active === true;
    this.order = star.order;

    if (thumbnail) {
        this.thumbnailPhoto = thumbnail.url;
    }
    if (coverPhoto) {
        this.coverPhoto = coverPhoto.url;
    }

    if (star.episodes) {
        this.episodes = star.episodes;
    }
}

module.exports = StarIndexModel;
