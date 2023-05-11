function CategoryIndexModel(category = {}) {

    const { pictures = [] } = category;
    const thumb = pictures.find(picture => picture.title === 'thumb');
    const coverPhoto = pictures.find(p => p.title === 'cover-photo');

    this.id = category._id;
    this.title = category.title;
    this.slug = category.friendly_title;
    this.enabled = category.active === true;
    this.order = category.order;
    this.random = category.random;

    if (thumb) {
        this.thumbnailPhoto = thumb.url;
    }

    if (coverPhoto) {
        this.coverPhoto = coverPhoto.url;
    }

    if (category.episodes) {
        this.episodes = category.episodes;
    }
}

module.exports = CategoryIndexModel;
