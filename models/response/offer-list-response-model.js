let OfferResponseModel = require('./offer-response-model');

/**
 * @apiDefine OfferListResponseModel
 *
 * @apiSuccess {Number} total Total offers available
 * @apiSuccess {OfferResponseModel[]} offers List of offers
 *
 * @apiSuccessExample {json} Example success
 *              {
 *                  "total": 1,
 *                  "offers": [
 *                      {
 *                          "id": "5925bd478b2d466f7ec0c596",
 *                          "title": "Up To 50% Off Men's Sneakers",
 *                          "slug": "up-to-50percent-off-mens-sneakers",
 *                          "description": "Grab your favorite Nike and Converse shoes at up to 50% off today! Grab running, training, and other kicks for less with no Nike coupon code needed.",
 *                          "instructions": "Click the button below\nComplete your purchase\nEnjoy!",
 *                          "viewPoints": 100,
 *                          "savePoints": 100,
 *                          "sharePoints": 50,
 *                          "rfiLink": "http://store.nike.com/us/en_us/pw/mens-clearance-shoes/47Z7puZoi3?mid=38660&mid=38660&cp=usns_aff_nike_080113_FPWseZFEpyY&site=FPWseZFEpyY-0vukNjv0tIeI5INdBP9IdQ",
 *                          "coverPhoto": "https://advncedcdn.vo.llnwd.net/clixtv_prod_storage/storage/57cdc2665aad0b6fcf67bb3d/5925bd478b2d466f7ec0c596/nike-md3x71.svg",
 *                          "logoPhoto": "https://advncedcdn.vo.llnwd.net/clixtv_prod_storage/storage/57cdc2665aad0b6fcf67bb3d/5925bd478b2d466f7ec0c596/nike-md3x7.svg",
 *                          "thumbnailPhoto": "https://advncedcdn.vo.llnwd.net/clixtv_prod_storage/storage/57cdc2665aad0b6fcf67bb3d/5925bd478b2d466f7ec0c596/nike-sneakers-offer.jpg",
 *                          "promoPhotos": [
 *                              "https://advncedcdn.vo.llnwd.net/clixtv_prod_storage/storage/57cdc2665aad0b6fcf67bb3d/5925bd478b2d466f7ec0c596/nike-blue-orange-shoe.jpg",
 *                              "https://advncedcdn.vo.llnwd.net/clixtv_prod_storage/storage/57cdc2665aad0b6fcf67bb3d/5925bd478b2d466f7ec0c596/nike-blue-shoe.jpg",
 *                              "https://advncedcdn.vo.llnwd.net/clixtv_prod_storage/storage/57cdc2665aad0b6fcf67bb3d/5925bd478b2d466f7ec0c596/nike-gray-shoe.jpg"
 *                          ],
 *                          "brand": { ... }
 *                      }
 *                  ]
 *              }
 */
function OfferListResponseModel(total, offers, isSirqul = false) {
    offers = (offers instanceof Array) ? offers : [];

    this.total = (isNaN(total)) ? 0 : total;
    this.offers = offers
        .map((offer) => {
            return new OfferResponseModel(offer, isSirqul);
        });
}

module.exports = OfferListResponseModel;