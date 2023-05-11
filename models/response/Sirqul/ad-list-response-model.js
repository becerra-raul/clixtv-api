let AdResponseModel = require('./ad-response-model');

function AdListResponseModel(ads) {
    ads.item = (ads.item && (ads.item instanceof Array)) ? ads.item : [];
    this.ads = ads.item.map(function(ad) {
        return new AdResponseModel(ad);
    });
}

module.exports = AdListResponseModel;