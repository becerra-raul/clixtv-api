let apiUtils = require('../../utils/api-utils'),
    slugService = require('../../services/slug-service'),
    pathUtils = require('../../utils/path-utils'),
    StarListResponseModel = require('./star-list-response-model');
    CategoryListResponseModel = require("./category-list-response-model");
    CharityListResponseModel = require("./charity-list-response-model");
    BrandListResponseModel = require('./brand-list-response-model');
    SeriesResponseModel = require('./series-response-model');

/**
 * @apiDefine EpisodeResponseModel
 *
 * @apiSuccess {String} id ID of episode
 * @apiSuccess {String} title Title of episode
 * @apiSuccess {String} slug Slug of episode
 * @apiSuccess {String} description Description of episode
 * @apiSuccess {String} runtime Total episode runtime
 * @apiSuccess {Number} views Total number of views the episode currently has
 * @apiSuccess {Number} likes Total number of likes the episode currently has
 * @apiSuccess {Number} viewPoints Points the user will receive for watching the episode
 * @apiSuccess {Number} sharePoints Points the user will receive for sharing the episode
 * @apiSuccess {String} endPhoto The photo used for the end of the episode
 * @apiSuccess {String} thumbnailPhoto Episode thumbnail photo
 * @apiSuccess {String} video URL for the episode video
 * @apiSuccess {StarResponseModel} star Star featured in episode
 * @apiSuccess {BrandListResponseModel} brands Brands featured in episode
 * @apiSuccess {CharityResponseModel} charity Charity featured in episode
 * @apiSuccess {SeriesResponseModel} series Episode parent series
 *
 * @apiSuccessExample {json} Example success
 *              {
 *                  "id": "591d3dffd739a0051b6272ee",
 *                  "title": "Universal Takeover",
 *                  "description": "Musical.ly stars Danielle Cohn, Lauren Godwin, Bryce Xavier, Tyler Brown, Owen Bodnar, Brianna Buchanan, Angel Eslora and Hannah Mae Dugmore take over Universal Studios Hollywood.",
 *                  "runtime": "0:33",
 *                  "episodeNumber": 1,
 *                  "views": 3195,
 *                  "likes": 23,
 *                  "viewPoints": 100,
 *                  "sharePoints": 50,
 *                  "endPhoto": "https://advncedcdn.vo.llnwd.net/clixtv_prod_storage/storage/57cdc2665aad0b6fcf67bb3d/591d3dffd739a0051b6272ee/S01E01.png",
 *                  "thumbnailPhoto": "https://advncedcdn.vo.llnwd.net/clixtv_prod_storage/storage/57cdc2665aad0b6fcf67bb3d/591d3dffd739a0051b6272ee/FollowMe-S01E01-Thumbnail1.jpg",
 *                  "video": "https://advncedcdn.vo.llnwd.net/clixtv_prod_storage/storage/57cdc2665aad0b6fcf67bb3d/591d3dffd739a0051b6272ee/FollowMe-S01E01.mov",
 *                  "slug": "universal-takeover"
 *                  "star": { ... },
 *                  "brands": { ... },
 *                  "charity": { ... },
 *                  "series": { ... },
 *              }
 */
function EpisodeResponseModel(episode, isSirqul = false) {
    if(isSirqul){
        // sirqul episode is album type "episodes", with linkedObjectResponse is an offerResponse containing the objects related to it
        // sirqul album response to clix episode response
        let likes = episode.likeCount || 0;
        let views = episode.viewedCount || 0;
        let metaData = {};
        if(episode.metaData)
            metaData = JSON.parse(episode.metaData);
        let linkedObjectData = {};
        let linkedObjectMetaData = {};
        if(episode.linkedObjectResponse){
            linkedObjectData = JSON.parse(episode.linkedObjectResponse);
            linkedObjectMetaData = linkedObjectData.metaData;
            if(typeof linkedObjectMetaData === 'string' || linkedObjectMetaData instanceof String)
                linkedObjectMetaData = JSON.parse(linkedObjectMetaData);
        }

        this.id = episode.albumId;
        this.audienceId = metaData.sirqul_audience_id;
        if (Array.isArray(episode.audiences)) {
            this.audienceIds = episode.audiences.map(audience => audience.id).join(',');
        }
        this.title = episode.title;
        this.runtime = episode.runtime;
        this.episodeNumber = metaData.episode_number || 1;
        // like default
        this.viewPoints = 100;
        this.sharePoints = 50;
        this.likes = likes;
        this.views = views;
        this.likeCount = episode.likeCount;
        this.favoriteCount = episode.favoriteCount;
        this.sharedCount = episode.sharedCount;
        this.commentsCount = episode.commentsCount;
        this.viewedCount = episode.viewedCount;
        this.clickedCount = episode.clickedCount;
        this.overallRating = episode.overallRating;
        this.userRating = episode.userRating;
        // this.slug = linkedObjectMetaData.friendly_title || metaData.friendly_title;
        this.slug = episode.subType;
        this.albumType = episode.albumType;
        this.coverAsset = episode.coverAsset;
        if(linkedObjectMetaData.videos && linkedObjectMetaData.videos.length){
            let video = linkedObjectMetaData.videos[0];
            this.zypeVideo = video.zype_video_id;
            this.video = video.zype_video_url || video.video_url;
        }

        if (linkedObjectData.image1) {
            this.endPhoto = linkedObjectData.image1;
            this.thumbnailPhoto = linkedObjectData.image1;
            this.carouselPhoto = linkedObjectData.image1;
        }

        this.description = metaData.description;

        if(linkedObjectData.offerAudiences){
            let starsSirqul = [];
            let brandsSirqul = [];
            let charitiesSirqul = [];
            let categoriesSirqul = [];
            let series = null;
            linkedObjectData.offerAudiences.forEach((au)=>{
                if(au.audienceType.startsWith("star")){
                    starsSirqul.push(au);
                } else if (au.audienceType.startsWith("series")){
                    let seriesRes = new SeriesResponseModel(au, true, "audience");
                    series = seriesRes;
                } else if (au.audienceType.startsWith("brand")){
                    brandsSirqul.push(au);
                } else if (au.audienceType.startsWith("charities")){
                    charitiesSirqul.push(au);
                } else if (au.audienceType.startsWith("category")){
                    categoriesSirqul.push(au);
                }
            });

            if(starsSirqul){
                this.stars = new StarListResponseModel(starsSirqul.length, starsSirqul, true, "audience");
                this.star = this.stars.stars[0];
            }
            if(brandsSirqul){
                this.brands = new BrandListResponseModel(brandsSirqul.length, brandsSirqul, true, "audience");
                this.brand = this.brands.brands[0];
            }
            if(charitiesSirqul){
                this.charities = new CharityListResponseModel(charitiesSirqul.length, charitiesSirqul, true, "audience");
                this.charity = this.charities.charities[0];
            }
            if(categoriesSirqul){
                this.categories = new CategoryListResponseModel(categoriesSirqul.length, categoriesSirqul, true, "audience");
            }
            if(series) this.series = series;
        }

        if (metaData.external_link) {
            this.externalLink = metaData.external_link;
        }
        if (metaData.rating) {
            this.externalLink = metaData.rating;
        }

        this.isFavorite = episode.favorite || false;
        this.isLiked = episode.hasLiked || false;

        this.categoryIds = episode.categories.map(cat => cat.categoryId).join(',');
        // convert from category response to categoryListResponse
        // if (episode.categories) {
        //     this.categories = episode.categories;
        // }


        //missing
        // socialLike, socialViews (replaced with sirqul likeCount and viewCount)
        // runtime
    } else {
        let likes = episode.socialLikes || 0;
        let views = episode.socialViews || 0;
        if (episode.likes) {
            likes += episode.likes;
        }
        if (episode.views) {
            views += episode.views;
        }

        this.id = episode.id;
        this.title = episode.title;
        this.runtime = episode.runtime;
        this.episodeNumber = episode.episodeNumber || 1;
        this.viewPoints = 100;
        this.sharePoints = 50;
        this.likes = likes;
        this.views = views;
        this.zypeVideo = episode.zypeVideo;

        if (episode.video) {
            this.video = episode.video;
        }

        if (episode.endPhoto) {
            this.endPhoto = episode.endPhoto;
        }
        if (episode.thumbnailPhoto) {
            this.thumbnailPhoto = episode.thumbnailPhoto;
        }
        if (episode.carouselPhoto) {
            this.carouselPhoto = episode.carouselPhoto;
        }

        this.slug = episode.slug;
        this.description = episode.description;

        if (episode.series) {
            this.series = episode.series;
        }

        if (episode.star) {
            this.star = episode.star;
        }

        if (episode.stars) {
            this.stars = episode.stars;
        }

        if (episode.brands) {
            this.brands = episode.brands;
        }

        if (episode.charity) {
            this.charity = episode.charity;
        }

        if (episode.charities) {
            this.charities = episode.charities;
        }
        if (episode.rating) {
            this.rating = episode.rating;
        }
        if (episode.categories) {
            this.categories = episode.categories;
        }
        if (episode.externalLink) {
            this.externalLink = episode.externalLink;
        }

        this.isFavorite = episode.isFavorite || false;
        this.isLiked = episode.isLiked || false;
    }
}

module.exports = EpisodeResponseModel;