let apiUtils = require('../../utils/api-utils');

/**
 * @apiDefine BrandResponseModel
 *
 * @apiSuccess {String} id ID of brand
 * @apiSuccess {String} title Title of brand
 * @apiSuccess {String} slug Slug of brand
 * @apiSuccess {String} description Description of brand
 * @apiSuccess {Number} viewPoints Points received for viewing the brand
 * @apiSuccess {String} coverPhoto URL for the brand cover photo
 * @apiSuccess {String} logoPhoto URL for the brand logo photo
 * @apiSuccess {String} video URL for the brand video
 *
 * @apiSuccessExample {json} Example success
 *              {
 *                  "id": "59114adc2bbc15029759c998",
 *                  "title": "Vans",
 *                  "description": "The Vans® brand has been connecting with youth culture to promote creative self-expression, authenticity and progression for nearly 50 years, while linking the brand’s deep roots in action sports with art, music and street culture.\n\nToday, the Vans® brand evolution continues. From its foundation as an original skateboarding company, to its emergence as a leading action sports brand, to its rise to become the world’s largest youth culture brand — the Vans® brand has taken on a power that matches its business performance.",
 *                  "viewPoints": 50,
 *                  "slug": "vans",
 *                  "coverPhoto": "https://advncedcdn.vo.llnwd.net/clixtv_prod_storage/storage/57cdc2665aad0b6fcf67bb3d/59114adc2bbc15029759c998/vanscover.jpg",
 *                  "logoPhoto": "https://advncedcdn.vo.llnwd.net/clixtv_storage/storage/57cdc2665aad0b6fcf67bb3d/59114adc2bbc15029759c998/vans-logo1.svg",
 *                  "video": "https://advncedcdn.vo.llnwd.net/clixtv_prod_storage/storage/57cdc2665aad0b6fcf67bb3d/59114adc2bbc15029759c998/TheStoryofVans.mp4",
 *                  "offers": {
 *                      "total": 3,
 *                      "offers": [ ... ]
 *                  }
 *              }
 */

function BrandResponseModel(brand = {}, isSirqul = false, sirqulType = "album") {
    // convert sirqul album response or audience response to clix star response
    // always return albumId as id in clix response

    if(isSirqul){
        let metaData = brand.metaData ? JSON.parse(brand.metaData) : {};
        this.albumType = brand.albumType;
        this.coverAsset = brand.coverAsset;
        if(sirqulType === "audience") {
            this.id = metaData.sirqul_album_id;
            this.title = brand.name;
            this.audienceId = brand.id;
            this.slug = metaData.friendly_title;
        } else {
            this.id = brand.albumId;
            this.title = brand.title;
            this.audienceId = metaData.sirqul_audience_id;
            this.slug = brand.subType;
        }

        this.description = brand.description;
        this.viewPoints = 50;

        if (metaData.videos) {
            let video = metaData.videos[0];
            this.zypeVideo = video.zype_video_id;
            this.video = video.zype_video_url;
        }
        if (metaData.cover_photo) {
            this.coverPhoto = metaData.cover_photo;
        }
        if (metaData.thumb_photo) {
            this.thumbnailPhoto = metaData.thumb_photo;
        }

        // if (brand.videoThumbnailPhoto) {
        //     this.videoThumbnailPhoto = brand.videoThumbnailPhoto;
        // }

        if (brand.offers) {
            this.offers = brand.offers;
        }

        if (brand.stars) {
            this.stars = brand.stars;
        }

        if (brand.episodes) {
            this.episodes = brand.episodes;
        }

        this.isFavorite = brand.favorite || false;
        this.totalVideos = metaData.total_episodes;

    } else {
        this.id = brand.id;
        this.title = brand.title;
        this.description = brand.description;
        this.viewPoints = 50;
        this.slug = brand.slug;
        this.zypeVideo = brand.zypeVideo;

        if (brand.video) {
            this.video = brand.video;
        }
        if (brand.coverPhoto) {
            this.coverPhoto = brand.coverPhoto;
        }
        if (brand.thumbnailPhoto) {
            this.thumbnailPhoto = brand.thumbnailPhoto;
        }

        if (brand.videoThumbnailPhoto) {
            this.videoThumbnailPhoto = brand.videoThumbnailPhoto;
        }

        if (brand.offers) {
            this.offers = brand.offers;
        }

        if (brand.stars) {
            this.stars = brand.stars;
        }

        if (brand.episodes) {
            this.episodes = brand.episodes;
        }

        this.isFavorite = brand.isFavorite || false;
    }
}

module.exports = BrandResponseModel;