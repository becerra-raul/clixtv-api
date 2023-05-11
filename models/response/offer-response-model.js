let apiUtils = require('../../utils/api-utils');
const BrandResponseModel = require("./brand-response-model");

/**
 * @apiDefine OfferResponseModel
 *
 * @apiSuccess {String} id ID of offer
 * @apiSuccess {String} title Title of offer
 * @apiSuccess {String} slug Slug of offer
 * @apiSuccess {String} description Offer description
 * @apiSuccess {String} instructions Redemption instructions
 * @apiSuccess {Number} viewPoints Points received for viewing offer
 * @apiSuccess {Number} savePoints Points received for saving offer
 * @apiSuccess {Number} sharePoints Points received for sharing offer
 * @apiSuccess {String} couponCode Coupon code
 * @apiSuccess {String} rfiLink Link used to redeem offer
 * @apiSuccess {String} coverPhoto Offer cover photo
 * @apiSuccess {String} logoPhoto Logo of the brand that the offer belongs to
 * @apiSuccess {String} thumbnailPhoto Offer thumbnail
 * @apiSuccess {String[]} promoPhotos Promo offer images
 * @apiSuccess {BrandResponseModel} brand Owner brand for the offer
 *
 * @apiSuccessExample {json} Example success
 *              {
 *                  "id": "5925bd478b2d466f7ec0c596",
 *                  "title": "Up To 50% Off Men's Sneakers",
 *                  "slug": "up-to-50percent-off-mens-sneakers",
 *                  "description": "Grab your favorite Nike and Converse shoes at up to 50% off today! Grab running, training, and other kicks for less with no Nike coupon code needed.",
 *                  "instructions": "Click the button below\nComplete your purchase\nEnjoy!",
 *                  "viewPoints": 100,
 *                  "savePoints": 100,
 *                  "sharePoints": 50,
 *                  "rfiLink": "http://store.nike.com/us/en_us/pw/mens-clearance-shoes/47Z7puZoi3?mid=38660&mid=38660&cp=usns_aff_nike_080113_FPWseZFEpyY&site=FPWseZFEpyY-0vukNjv0tIeI5INdBP9IdQ",
 *                  "coverPhoto": "https://advncedcdn.vo.llnwd.net/clixtv_prod_storage/storage/57cdc2665aad0b6fcf67bb3d/5925bd478b2d466f7ec0c596/nike-md3x71.svg",
 *                  "logoPhoto": "https://advncedcdn.vo.llnwd.net/clixtv_prod_storage/storage/57cdc2665aad0b6fcf67bb3d/5925bd478b2d466f7ec0c596/nike-md3x7.svg",
 *                  "thumbnailPhoto": "https://advncedcdn.vo.llnwd.net/clixtv_prod_storage/storage/57cdc2665aad0b6fcf67bb3d/5925bd478b2d466f7ec0c596/nike-sneakers-offer.jpg",
 *                  "promoPhotos": [
 *                      "https://advncedcdn.vo.llnwd.net/clixtv_prod_storage/storage/57cdc2665aad0b6fcf67bb3d/5925bd478b2d466f7ec0c596/nike-blue-orange-shoe.jpg",
 *                      "https://advncedcdn.vo.llnwd.net/clixtv_prod_storage/storage/57cdc2665aad0b6fcf67bb3d/5925bd478b2d466f7ec0c596/nike-blue-shoe.jpg",
 *                      "https://advncedcdn.vo.llnwd.net/clixtv_prod_storage/storage/57cdc2665aad0b6fcf67bb3d/5925bd478b2d466f7ec0c596/nike-gray-shoe.jpg"
 *                  ],
 *                  "brand": { ... }
 *              }
 */

function OfferResponseModel(offer, isSirqul = false) {
    // sirqul offer response to clix offer response

    if(isSirqul){
        let metaData = offer.metaData ? JSON.parse(offer.metaData) : {};
        this.id = offer.offerId;
        this.title = offer.offerName;

        // this.slug = metaData.friendly_title;
        this.slug = this.id.toString();

        this.description = offer.details || metaData.description;
        this.viewPoints = 100;
        this.savePoints = 100;
        this.sharePoints = 50;

        if(offer.image){
            this.thumbnailPhoto = offer.image;
        }
        let promoPhotos = [];
        for(let i = 1; i <= 5; i++){
            if(offer["image"+i]){
                promoPhotos.push(offer["image"+i]);
            }
        }
        if(promoPhotos.length)
            this.promoPhotos = promoPhotos;

        this.rfiLink = offer.externalUrl;

        if(offer.offerAudiences && offer.offerAudiences.length){
            let offerBrand = new BrandResponseModel(offer.offerAudiences[0], true, "audience");
            this.brand = offerBrand;
            this.logoPhoto = this.brand.thumbnailPhoto;
        }

        this.isFavorite = offer.favorite || false;
    } else {
        this.id = offer.id;
        this.title = offer.title;
        this.slug = offer.slug;
        this.description = offer.description;
        this.viewPoints = 100;
        this.savePoints = 100;
        this.sharePoints = 50;

        if (offer.thumbnailPhoto) {
            this.thumbnailPhoto = offer.thumbnailPhoto;
        }

        this.rfiLink = offer.rfiLink;
        this.promoPhotos = offer.promoPhotos;

        if (offer.brand) {
            this.brand = offer.brand;
            this.logoPhoto = offer.brand.thumbnailPhoto;
        }

        this.isFavorite = offer.isFavorite || false;
    }
}

module.exports = OfferResponseModel;