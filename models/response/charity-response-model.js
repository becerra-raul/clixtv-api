let apiUtils = require('../../utils/api-utils');

/**
 * @apiDefine CharityResponseModel
 *
 * @apiSuccess {String} id ID of charity
 * @apiSuccess {String} title Title of charity
 * @apiSuccess {String} slug Slug of charity
 * @apiSuccess {String} description Description of charity
 * @apiSuccess {String} coverPhoto URL for the charity cover photo
 * @apiSuccess {String} logoPhoto URL for the charity logo photo
 * @apiSuccess {String} thumbnailPhoto URL for the charity video thumbnail photo
 * @apiSuccess {String} video URL for the charity video
 *
 * @apiSuccessExample {json} Example success
 *              {
 *                  "id": "5911e4f332399a7577df3482",
 *                  "title": "Special Olympics",
 *                  "description": "Through the power of sports, people with intellectual disabilities discover new strengths and abilities, skills and success. Our athletes find joy, confidence and fulfillment -- on the playing field and in life. They also inspire people in their communities and elsewhere to open their hearts to a wider world of human talents and potential. Here's a slideshow showing the full spectrum of our activities.  ",
 *                  "slug": "special-olympics",
 *                  "coverPhoto": "https://advncedcdn.vo.llnwd.net/clixtv_storage/storage/57cdc2665aad0b6fcf67bb3d/5911e4f332399a7577df3482/specialolympicscover.jpg",
 *                  "logoPhoto": "https://advncedcdn.vo.llnwd.net/clixtv_storage/storage/57cdc2665aad0b6fcf67bb3d/5911e4f332399a7577df3482/special-olympics-logo.svg",
 *                  "thumbnailPhoto": "https://advncedcdn.vo.llnwd.net/clixtv_prod_storage/storage/57cdc2665aad0b6fcf67bb3d/5911e4f332399a7577df3482/special-olympics-videothumb.jpg",
 *                  "video": "https://advncedcdn.vo.llnwd.net/clixtv_prod_storage/storage/57cdc2665aad0b6fcf67bb3d/5911e4f332399a7577df3482/2017SpecialOlympicsWorldWinterGamespromovideo.mp4"
 *              }
 */
function CharityResponseModel(charity = {}, isSirqul = false, sirqulType = "album") {

    if(isSirqul) {
        let metaData = charity.metaData ? JSON.parse(charity.metaData) : {};
        this.albumType = charity.albumType;
        this.coverAsset = charity.coverAsset;
        if(sirqulType === "audience") {
            this.id = metaData.sirqul_album_id;
            this.title = charity.name;
            this.audienceId = charity.id;
            this.slug = metaData.friendly_title;
        } else {
            this.id = charity.albumId;
            this.title = charity.title;
            this.audienceId = metaData.sirqul_audience_id;
            this.slug = charity.subType;
        }


        this.description = charity.description;
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

        if (charity.videoThumbnailPhoto) {
            this.videoThumbnailPhoto = charity.videoThumbnailPhoto;
        }

        if (charity.stars) {
            this.stars = charity.stars;
        }

        if (charity.episodes) {
            this.episodes = charity.episodes;
        }

        this.isFavorite = charity.isFavorite || false;
        this.totalVideos = metaData.total_episodes;

    } else {
        this.id = charity.id;
        this.title = charity.title;
        this.description = charity.description;
        this.slug = charity.slug;
        this.zypeVideo = charity.zypeVideo;

        if (charity.video) {
            this.video = charity.video;
        }

        if (charity.thumbnailPhoto) {
            this.thumbnailPhoto = charity.thumbnailPhoto;
        }

        if (charity.coverPhoto) {
            this.coverPhoto = charity.coverPhoto;
        }

        if (charity.videoThumbnailPhoto) {
            this.videoThumbnailPhoto = charity.videoThumbnailPhoto;
        }

        if (charity.stars) {
            this.stars = charity.stars;
        }

        if (charity.episodes) {
            this.episodes = charity.episodes;
        }

        this.isFavorite = charity.isFavorite || false;
    }

}

module.exports = CharityResponseModel;