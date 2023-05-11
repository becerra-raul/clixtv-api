
/**
 * @apiDefine ConfigurationResponseModel
 *
 * @apiSuccess {String} key Configuration key
 * @apiSuccess {String} value Configuration value
 *
 * @apiSuccessExample {json} Example success
 *              {
 *                  "key": "charity.coverphoto",
 *                  "value": "https://api.clixtv.com/v2.0/media/image?url=https%3A%2F%2Fadvncedcdn.vo.llnwd.net%2Fclixtv_prod_storage%2Fstorage%2F57cdc2665aad0b6fcf67bb3d%2F5925f63a8b2d466f7ec0c5d7%2Flyft-20-offer.jpg&blur=28"
 *              }
 */
function ConfigurationResponseModel(configuration) {
    this.key = configuration.key;
    this.value = configuration.value;
}

module.exports = ConfigurationResponseModel;