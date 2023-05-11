let CharityResponseModel = require('./charity-response-model');

/**
 * @apiDefine CharityListResponseModel
 *
 * @apiSuccess {Number} total Total charities available
 * @apiSuccess {CharityResponseModel[]} charities List of charities
 *
 *
 * @apiSuccessExample {json} Example success
 *              {
 *                  "total": 1,
 *                  "charities": [
 *                      {
 *                          "id": "5911e4f332399a7577df3482",
 *                          "title": "Special Olympics",
 *                          "description": "Through the power of sports, people with intellectual disabilities discover new strengths and abilities, skills and success. Our athletes find joy, confidence and fulfillment -- on the playing field and in life. They also inspire people in their communities and elsewhere to open their hearts to a wider world of human talents and potential. Here's a slideshow showing the full spectrum of our activities.  ",
 *                          "slug": "special-olympics",
 *                          "episodes": {
 *                              "total": 16,
 *                              "episodes": [...]
 *                          },
 *                          "coverPhoto": "https://advncedcdn.vo.llnwd.net/clixtv_storage/storage/57cdc2665aad0b6fcf67bb3d/5911e4f332399a7577df3482/specialolympicscover.jpg",
 *                          "logoPhoto": "https://advncedcdn.vo.llnwd.net/clixtv_storage/storage/57cdc2665aad0b6fcf67bb3d/5911e4f332399a7577df3482/special-olympics-logo.svg",
 *                          "thumbnailPhoto": "https://advncedcdn.vo.llnwd.net/clixtv_prod_storage/storage/57cdc2665aad0b6fcf67bb3d/5911e4f332399a7577df3482/special-olympics-videothumb.jpg",
 *                          "video": "https://advncedcdn.vo.llnwd.net/clixtv_prod_storage/storage/57cdc2665aad0b6fcf67bb3d/5911e4f332399a7577df3482/2017SpecialOlympicsWorldWinterGamespromovideo.mp4"
 *                      }
 *                  ]
 *              }
 */
function CharityListResponseModel(total, charities, isSirqul = false, sirqulType = "album") {
    charities = (charities instanceof Array) ? charities : [];

    this.total = (isNaN(total)) ? 0 : total;
    this.charities = charities
        .map((charity) => {
            return new CharityResponseModel(charity, isSirqul, sirqulType);
        })
        .sort((a, b) => {
            return a.order - b.order;
        });
}

module.exports = CharityListResponseModel;