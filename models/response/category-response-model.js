let apiUtils = require('../../utils/api-utils'),
    ImageMediaResponseModel = require('./image-media-response-model');

/**
 * @apiDefine CategoryResponseModel
 *
 * @apiSuccess {String} id ID of category
 * @apiSuccess {String} title Title of category
 * @apiSuccess {String} slug Slug of category
 * @apiSuccess {Object} thumbnailPhoto Thumbnail photo media object
 * @apiSuccess {Object} coverPhoto Cover photo media object
 *
 * @apiSuccessExample {json} Example success
 *              {
 *                  "id": 1,
 *                  "title": "Trending Now",
 *                  "slug": "trending-now",
 *                  "coverPhoto": {
 *                      "id": 13,
 *                      "densities": {
 *                          "1x": "https://cdn.clixtv.com/images/trending-now-cat-head@1x.jpg",
 *                          "2x": "https://cdn.clixtv.com/images/trending-now-cat-head@2x.jpg",
 *                          "3x": "https://cdn.clixtv.com/images/trending-now-cat-head@3x.jpg"
 *                      }
 *                  },
 *                  "thumbnailPhoto": {
 *                      "id": 2,
 *                      "densities": {
 *                          "1x": "https://cdn.clixtv.com/images/trendingthumb@1x.jpg",
 *                          "2x": "https://cdn.clixtv.com/images/trendingthumb@2x.jpg",
 *                          "3x": "https://cdn.clixtv.com/images/trendingthumb@3x.jpg"
 *                      }
 *                  }
 *              }
 */

function CategoryResponseModel(category, isSirqul = false, sirqulType = "album") {
    if(isSirqul){
        //sirqul album response or audience response to clix category response
        // always return album response

        let metaData = category.metaData ? JSON.parse(category.metaData) : {};
        this.albumType = category.albumType;
        this.coverAsset = category.coverAsset;
        if(sirqulType === "audience") {
            this.id = metaData.sirqul_album_id;
            this.title = category.name;
            this.audienceId = category.id;
            this.slug = metaData.friendly_title;
        } else {
            this.id = category.albumId;
            this.title = category.title;
            this.audienceId = metaData.sirqul_audience_id;
            this.slug = category.subType;
        }

        if (metaData.thumb_photo){
            this.thumbnailPhoto = metaData.thumb_photo;
        }
        if(metaData.cover_photo){
            this.coverPhoto = metaData.cover_photo;
        }

        if (category.episodes) {
            this.episodes = category.episodes;
        }
        this.random = metaData.random || false;

        this.isFavorite = category.favorite || false;
        
        this.isLiked = category.hasLiked || false;

        // missing fields from sirqul
        // this.isFavorite = item.isFavorite || false;
    } else {
        this.id = category.id;
        this.title = category.title;
        this.slug = category.slug;
        if (category.coverPhoto) {
            this.coverPhoto = category.coverPhoto;
        }
        if (category.thumbnailPhoto) {
            this.thumbnailPhoto = category.thumbnailPhoto;
        }

        if (category.episodes) {
            this.episodes = category.episodes;
        }

        this.isFavorite = category.isFavorite || false;
        this.random = category.random || false;
    }
}


module.exports = CategoryResponseModel;