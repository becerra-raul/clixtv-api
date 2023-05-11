let CategoryResponseModel = require('./category-response-model');

/**
 * @apiDefine CategoryListResponseModel
 *
 * @apiSuccess {Number} total Total categories available
 * @apiSuccess {CategoryResponseModel[]} categories List of categories
 *
 *
 * @apiSuccessExample {json} Example success
 *              {
 *                  "total": 11,
 *                  "categories": [
 *                      {
 *                          "id": "57d1a8fd60130003003b727b",
 *                          "title": "Trending Now",
 *                          "slug": "trending-now",
 *                          "coverPhoto": "https://advncedcdn.vo.llnwd.net/clixtv_prod_storage/storage/57cdc2665aad0b6fcf67bb3d/57d1a8fd60130003003b727b/trending-now-cat-head.jpg",
 *                          "thumbnailPhoto": "https://advncedcdn.vo.llnwd.net/clixtv_prod_storage/storage/57cdc2665aad0b6fcf67bb3d/57d1a8fd60130003003b727b/trendingthumb.jpg",
 *                          "episodes": {
 *                              "total": 3,
 *                              "episodes": [ ... ]
 *                          }
 *                      }
 *                  ]
 *              }
 */
function CategoryListResponseModel(total, categories, isSirqul = false, sirqulType = "category") {
    categories = (categories instanceof Array) ? categories : [];

    this.total = (isNaN(total)) ? 0 : total;
    this.categories = categories
        .map((category) => {
            return new CategoryResponseModel(category, isSirqul, sirqulType);
        })
}

module.exports = CategoryListResponseModel;