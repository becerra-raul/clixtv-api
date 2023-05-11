let apiUtils = require('../../utils/api-utils');

function MediaResponseModel(media) {
    this.id = media.id;
    this.type = media.type;
    this.path = apiUtils.getPaths().cdn + '/' + media.path;
}

module.exports = MediaResponseModel;