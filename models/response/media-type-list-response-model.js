let MediaTypeResponseModel = require('./media-type-response-model');

/**
 * @apiDefine CategoryListResponseModel
 *
 * @apiSuccess {Number} total Total types available
 * @apiSuccess {MediaTypeResponseModel[]} types List of types
 *
 *
 * @apiSuccessExample {json} Example success
 *              {
 *                  "total": 17,
 *                  "types": [
 *                      {
 *                          "id": 4,
 *                          "label": "Brand Cover Photo",
 *                          "type": "IMAGE"
 *                      }
 *                  ]
 *              }
 */
function MediaTypeListResponseModel(total, types) {
    this.total = total;
    if (types) {
        this.types = types
            .map((type) => {
                return new MediaTypeResponseModel(type);
            });
    }
}

module.exports = MediaTypeListResponseModel;