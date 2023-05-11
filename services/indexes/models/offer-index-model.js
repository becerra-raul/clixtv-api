function OfferIndexModel(offer = {}) {

    const { pictures = [] } = offer;
    const thumb = pictures.find(picture => picture.title === 'thumb');
    const promoPhotos = pictures.filter(picture => picture.title === 'promo');

    this.id = offer._id;
    this.title = offer.title;
    this.description = offer.description;
    this.slug = offer.friendly_title;
    this.rfiLink = offer.rfi;
    this.enabled = offer.active === true;
    this.order = offer.order || 0;

    if (thumb) {
        this.thumbnailPhoto = thumb.url;
    }
    this.promoPhotos = promoPhotos.map(photo => photo.url);

    if (offer.brand) {
        this.brand = offer.brand;
    }
}

module.exports = OfferIndexModel;