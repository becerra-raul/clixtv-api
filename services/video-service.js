let videoDao = require('../persistence/video-dao'),
    VideoResponseModel = require('../models/response/video-response-model');

function Service() {}

Service.prototype.getVideoById = async function(id) {
    let video = await videoDao.getVideoById(id);
    return new VideoResponseModel(video);
};

module.exports = new Service();