function BrandIndexModel(brand = {}) {

    const { pictures = [] } = brand;
    const thumb = pictures.find(picture => picture.title === 'thumb');
    const coverPhoto = pictures.find(p => p.title === 'cover-photo');

    this.id = brand._id;
    this.title = brand.title;
    this.description = brand.description;
    this.slug = brand.friendly_title;
    this.enabled = brand.active === true;
    this.order = brand.order;

    if (thumb) {
        this.thumbnailPhoto = thumb.url;
    }

    if (coverPhoto) {
        this.coverPhoto = coverPhoto.url;
    }

    if (brand.videoThumbnailPhoto) {
        this.videoThumbnailPhoto = brand.videoThumbnailPhoto;
    }

    if (brand.offers) {
        this.offers = brand.offers;
    }

    if (brand.video_ids) {
        this.videoIds = brand.video_ids;
    }
}

module.exports = BrandIndexModel;
