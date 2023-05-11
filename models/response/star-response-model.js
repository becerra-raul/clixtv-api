let apiUtils = require('../../utils/api-utils');
const BrandListResponseModel = require("./brand-list-response-model");
const CharityListResponseModel = require("./charity-list-response-model");

/**
 * @apiDefine StarResponseModel
 *
 * @apiSuccess {String} id ID of star
 * @apiSuccess {String} name Name of star
 * @apiSuccess {String} slug Slug of star
 * @apiSuccess {String} coverPhoto URL for the star cover photo
 * @apiSuccess {String} thumbnailPhoto URL for the star thumbnail photo
 *
 * @apiSuccessExample {json} Example success
 *               {
 *                  "id": "590ac858fbb3d633b64e3607",
 *                  "name": "Redfoo",
 *                  "coverPhoto": "https://advncedcdn.vo.llnwd.net/clixtv_storage/storage/57cdc2665aad0b6fcf67bb3d/590ac858fbb3d633b64e3607/redfoocover1.jpg",
 *                  "thumbnailPhoto": "https://advncedcdn.vo.llnwd.net/clixtv_storage/storage/57cdc2665aad0b6fcf67bb3d/590ac858fbb3d633b64e3607/redfoothumbnail1.jpg",
 *                  "slug": "redfoo",
 *                  "episodes": {
 *                      "total": 4,
 *                      "episodes": [ ... ]
 *                  }
 *              }
 */

function StarResponseModel(star = {}, isSirqul = false, sirqulType = "album") {
    // sirqul album response or audience response to clix star response
    // always return albumId as id in clix response

    if(isSirqul){
        let metaData = star.metaData ? JSON.parse(star.metaData) : {};
        this.albumType = star.albumType;
        this.coverAsset = star.coverAsset;
        if(sirqulType === "audience") {
            this.id = metaData.sirqul_album_id;
            this.name = star.name;
            this.audienceId = star.id;
            this.slug = metaData.friendly_title;
        } else {
            this.id = star.albumId;
            this.name = star.title;
            this.audienceId = metaData.sirqul_audience_id;
            this.slug = star.subType;
        }

        if (metaData.cover_photo) {
            this.coverPhoto = metaData.cover_photo;
        }
        if (metaData.thumb_photo) {
            this.thumbnailPhoto = metaData.thumb_photo;
        }

        if (star.episodes) {
            this.episodes = star.episodes;
        }

        if (star.series) {
            this.series = star.series;
        }


        if(star.audiences){
            let brandsSirqul = [];
            let charitiesSirqul = [];
            star.audiences.forEach((au)=>{
                if (au.audienceType.startsWith("brand||")){
                    brandsSirqul.push(au);
                } else if (au.audienceType.startsWith("charities||")){
                    charitiesSirqul.push(au);
                }
            });

            if(brandsSirqul){
                this.brands = new BrandListResponseModel(brandsSirqul.length, brandsSirqul, true, "audience");
                this.brand = this.brands.brands[0];
            }
            if(charitiesSirqul){
                this.charities = new CharityListResponseModel(brandsSirqul.length, charitiesSirqul, true, "audience");
                this.charity = this.charities.charities[0];
            }
        }

        this.isFavorite = star.favorite || false;

        this.totalVideos = metaData.total_episodes;
    } else {
        this.id = star.id;
        this.name = star.name;
        this.slug = star.slug;

        if (star.episodes) {
            this.episodes = star.episodes;
        }

        if (star.series) {
            this.series = star.series;
        }

        if (star.coverPhoto) {
            this.coverPhoto = star.coverPhoto;
        }
        if (star.thumbnailPhoto) {
            this.thumbnailPhoto = star.thumbnailPhoto;
        }

        if (star.brands) {
            this.brands = star.brands;
        }
        if (star.charities) {
            this.charities = star.charities;
        }

        this.isFavorite = star.isFavorite || false;
    }


}

module.exports = StarResponseModel;