let SeriesResponseModel = require('./series-response-model');

/**
 * @apiDefine SeriesListResponseModel
 *
 * @apiSuccess {Number} total Total series available
 * @apiSuccess {SeriesResponseModel[]} series List of series
 *
 * @apiSuccessExample {json} Example success
 *              {
 *                  "total": 1,
 *                  "series": [
 *                      {
 *                          "id": "590ac858fbb3d633b64e3607",
 *                          "title": "Universal Takeover"
 *                      }
 *                  ]
 *              }
 */
function SeriesListResponseModel(total, series, isSirqul = false, sirqulType = "album") {
    this.total = total;
    if (series) {
        this.series = series
            .map((s) => {
                return new SeriesResponseModel(s, isSirqul, sirqulType);
            });
    }
}

module.exports = SeriesListResponseModel;