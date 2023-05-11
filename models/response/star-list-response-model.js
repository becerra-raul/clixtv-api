let StarResponseModel = require('./star-response-model');

/**
 * @apiDefine StarListResponseModel
 *
 * @apiSuccess {Number} total Total stars available
 * @apiSuccess {StarResponseModel[]} stars List of stars
 *
 * @apiSuccessExample {json} Example success
 *              {
 *                  "total": 1,
 *                  "stars": [
 *                      {
 *                          "id": "590ac858fbb3d633b64e3607",
 *                          "name": "Redfoo",
 *                          "coverPhoto": "https://advncedcdn.vo.llnwd.net/clixtv_storage/storage/57cdc2665aad0b6fcf67bb3d/590ac858fbb3d633b64e3607/redfoocover1.jpg",
 *                          "thumbnailPhoto": "https://advncedcdn.vo.llnwd.net/clixtv_storage/storage/57cdc2665aad0b6fcf67bb3d/590ac858fbb3d633b64e3607/redfoothumbnail1.jpg",
 *                          "slug": "redfoo",
 *                          "episodes": {
 *                              "total": 4,
 *                              "episodes": [ ... ]
 *                          }
 *                      }
 *                  ]
 *              }
 */
function StarListResponseModel(total = 0, stars = [], isSirqul = false, sirqulType = "album") {

    this.total = total;
    this.stars = stars.map(star => new StarResponseModel(star, isSirqul, sirqulType));
}

module.exports = StarListResponseModel;