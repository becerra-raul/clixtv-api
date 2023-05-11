/**
 * @apiDefine VideoResponseModel
 *
 * @apiSuccess {String} id ID of video
 * @apiSuccess {String} source Path to source file
 * @apiSuccess {Number} status Current video transcode status
 *
 * @apiSuccessExample {json} Example success
 *              {
 *                  "id": "1",
 *                  "source": "clixtv.prod/media/videos/unprocessed/party-rock-promo.m4v",
 *                  "status": 1
 *              }
 */

function VideoResponseModel(data) {
    this.id = data.id;
    this.source = data.source;
    this.status = data.status;
}

module.exports = VideoResponseModel;