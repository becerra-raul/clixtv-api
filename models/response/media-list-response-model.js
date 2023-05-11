let MediaResponseModel = require('./media-response-model');

function MediaListResponseModel(total, media) {
    this.total = total;
    if (media) {
        this.media = media
            .map((m) => {
                return new MediaResponseModel(m);
            });
    }
}

module.exports = MediaListResponseModel;