let apiUtils = require('../../utils/api-utils'),
    imageSizeEnum = require('../enum/image-size-enum');

function getPathForSize(path, size) {
    let fileType = path.substr(path.lastIndexOf('.'));
    return path.replace(fileType, '-' + size + fileType);
}

function ImageMediaResponseModel(media) {

    this.id = media.id;
    this.path = apiUtils.getPaths().cdn + '/' + media.path;

    let resolutions = media.resolutions;
    if (resolutions) {
        this.resolutions = resolutions.split(',');
    }

    let sizes = [];
    if (media.sizes) {
        sizes = media.sizes.split(',');
        this.sizes = {};
        sizes.forEach((size) => {
            this.sizes[size] = getPathForSize(apiUtils.getPaths().cdn + '/' + media.path, size);
        })
    }
}

module.exports = ImageMediaResponseModel;