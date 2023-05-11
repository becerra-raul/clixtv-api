function CharityIndexModel(charity = {}) {

    const { pictures = [] } = charity;
    const thumb = pictures.find(picture => picture.title === 'thumb');
    const coverPhoto = pictures.find(p => p.title === 'cover-photo');

    this.id = charity._id;
    this.title = charity.title;
    this.description = charity.description;
    this.slug = charity.friendly_title;
    this.order = charity.order;


    if (charity.videoThumbnailPhoto) {
        this.videoThumbnailPhoto = charity.videoThumbnailPhoto;
    }

    if (thumb) {
        this.thumbnailPhoto = thumb.url;
    }

    if (coverPhoto) {
        this.coverPhoto = coverPhoto.url;
    }

    if (charity.video_ids) {
        this.videoIds = charity.video_ids;
    }
}

module.exports = CharityIndexModel;
