let ImageMediaResponseModel = require('./image-media-response-model');

function ImageMediaListResponseModel(total, media) {
    this.total = total;
    if (media) {
        this.media = media
            .map((m) => {
                return new ImageMediaResponseModel(m);
            });
    }
}

module.exports = ImageMediaListResponseModel;